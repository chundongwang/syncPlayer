#!/usr/bin/env python
#
# Copyright 2014 Chundong Wang
#
import logging
import json
import os
import flask
import time
import traceback

from model import DateTimeEncoder,Room
from flask import render_template
from google.appengine.api import users
from google.appengine.api import memcache

app = flask.Flask(__name__, template_folder='webapp')
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='t0&&r1o-uf=+5e$)3#p+)9m^qc)5zklxr7%ork7k7sm@*hmok5'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.

_is_local = os.environ['SERVER_SOFTWARE'].startswith('Development')

def isLocal():
    return _is_local

def json_succ(extra=None,data=None):
    resp = {"result":"SUCCEED"}
    if extra is not None:
        resp["extra"]=extra
    if data is not None:
        resp["data"]=data
    return json_response(resp)

class reason:
    ROOM_NAME_REQUIRED=1
    EXIST_ROOM_NAME=2
    NO_ROOM_FOUND=3
    LOGIN_REQUIRED=401
    INVALID_PARAMETER=400
    FORBIDDEN_OPERATION=403

def caller(up=0):
    '''Get file name, line number, function name and
    source text of the caller's caller as 4-tuple:
    (file, line, func, text).

    The optional argument 'up' allows retrieval of
    a caller further back up into the call stack.

    Note, the source text may be None and function
    name may be '?' in the returned result. In
    Python 2.3+ the file name may be an absolute
    path.
    '''
    try: # just get a few frames
        f = traceback.extract_stack(limit=up+2)
        if f:
            return f[0]
    except:
        if isLocal():
            traceback.print_exc()
        pass
    # running with psyco?
    return ('', 0, '', None)

def json_fail(reason=None,extra=None,data=None):
    resp = {"result":"FAILED"}
    if reason is not None:
        resp["reason"]=reason
    if extra is not None:
        resp["extra"]=extra
    if data is not None:
        resp["data"]=data
    if isLocal():
        (filename, line, func, text) = caller(up=1)
        logging.warning('error[%d] occured in %s:%s, %s.'%(reason, filename, line, func))
    return json_response(resp)

def json_response(obj):
    response = flask.make_response(json.dumps(obj, cls=DateTimeEncoder))
    response.headers['Content-Type'] = 'application/json'
    response.headers['mimetype'] = 'application/json'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    return response

@app.route('/room', methods=['GET', 'POST'])
@app.route('/room/<room_name>', methods=['GET', 'PUT', 'DELETE'])
def room_api(room_name=None):
    user = users.get_current_user()
    if flask.request.method == 'GET':
        if room_name is None:
            rooms = []
            if not user:
                rooms = Room.fetch_all_anonymous()
            else:
                rooms = Room.fetch_all()
            return json_response([room.to_dict() for room in rooms])
        else:
            room = Room.fetch_by_name(room_name)
            if room is None:
                return json_fail(reason.NO_ROOM_FOUND)
            return json_response(room.to_dict()) 
    elif flask.request.method == 'POST':
        if not user:
            return json_fail(reason.LOGIN_REQUIRED)
        else:
            room_info = flask.request.get_json(silent=True)
            if room_info is None:
                return json_fail(reason.INVALID_PARAMETER)

            if "name" not in room_info:
                return json_fail(reason.ROOM_NAME_REQUIRED)

            room = Room.fetch_by_name(room_info["name"])
            logging.info('create_room(%s):%s'%(room_info["name"],room.__class__.__name__))
            if room is not None:
                return json_fail(reason.EXIST_ROOM_NAME)

            room = Room(creator_email=user.email(), name=room_info["name"])
            if "current_time" in room_info:
                room.current_time=int(room_info["current_time"])
            if "cover" in room_info:
                room.cover=room_info["cover"]
            room.put()
            return json_succ(data=room.to_dict())
    elif flask.request.method == 'PUT':
        if not user:
            return json_fail(reason.LOGIN_REQUIRED)

        room = Room.fetch_by_name(room_name)
        logging.info('update_room(%s):%s'%(room_name,room.__class__.__name__))
        if room is None:
            return json_fail(reason.NO_ROOM_FOUND)
        if user.email() != room.creator_email:
            return json_fail(reason.FORBIDDEN_OPERATION)

        room_info = flask.request.get_json(silent=True)
        if room_info is None:
            return json_fail(reason.INVALID_PARAMETER)

        if "current_time" in room_info:
            room.current_time=int(room_info["current_time"])
        if "cover" in room_info:
            room.cover=room_info["cover"]
        room.put()
        return json_succ()
    elif flask.request.method == 'DELETE':
        if not user:
            return json_fail(reason.LOGIN_REQUIRED)

        room = Room.fetch_by_name(room_name)
        logging.info('delete_room(%s):%s'%(room_name,room.__class__.__name__))
        if room is not None:
            if user.email() != room.creator_email:
                return json_fail(reason.FORBIDDEN_OPERATION)
            else:
                room.key.delete()
                return json_succ()
        else:
            return json_fail(reason.NO_ROOM_FOUND, room_name)

    else:
        return json_fail(reason.INVALID_PARAMETER)

@app.route('/room/<room_name>/video', methods=['GET', 'POST', 'PUT'])
@app.route('/room/<room_name>/video/<video_index>', methods=['GET', 'DELETE'])
def video_api(room_name, video_index=None):
    user = users.get_current_user()
    if flask.request.method == 'GET':
        room = Room.fetch_by_name(room_name)
        if room is None:
            return json_fail(reason.NO_ROOM_FOUND)
        if video_index is None:
            return json_response(room.video_ids)
        elif video_index >= len(room.video_ids):
            return json_fail(reason.INVALID_PARAMETER)
        else:
            return json_response(room.video_ids[video_index])
    elif flask.request.method == 'POST':
        if not user:
            return json_fail(reason.LOGIN_REQUIRED)
        room = Room.fetch_by_name(room_name)
        if room is None:
            return json_fail(reason.NO_ROOM_FOUND)
        if user.email() != room.creator_email:
            return json_fail(reason.FORBIDDEN_OPERATION)

        video_info = flask.request.get_json(silent=True)
        if video_info is None or "id" not in video_info:
            return json_fail(reason.INVALID_PARAMETER)
        room.video_ids.append(video_info["id"]);
        room.put()
        return json_succ()
    elif flask.request.method == 'PUT':
        if not user:
            return json_fail(reason.LOGIN_REQUIRED)
        room = Room.fetch_by_name(room_name)
        if room is None:
            return json_fail(reason.NO_ROOM_FOUND)
        if user.email() != room.creator_email:
            return json_fail(reason.FORBIDDEN_OPERATION)

        video_action = flask.request.get_json(silent=True)
        if video_action is None:
            return json_fail(reason.INVALID_PARAMETER)
        if "op" not in video_action or "current_time" not in video_action or "roundtrip" not in video_action:
            return json_fail(reason.INVALID_PARAMETER)
        if video_action["op"] not in ['NOTSTARTED', 'PAUSED', 'PLAYING', 'ENDED']:
            return json_fail(reason.INVALID_PARAMETER)
        room.state = video_action["op"]
        # Save current_time+roundtrip/2 and last updated time. 
        # When read, it'll be now()-last_updated_time+current_time+roundtrip/2
        room.current_time = int(video_action["current_time"]) + int(video_action["roundtrip"])/2
        room.put()
        return json_succ()
    elif flask.request.method == 'DELETE':
        if not user:
            return json_fail(reason.LOGIN_REQUIRED)
        room = Room.fetch_by_name(room_name)
        if room is None:
            return json_fail(reason.NO_ROOM_FOUND)
        if user.email() != room.creator_email:
            return json_fail(reason.FORBIDDEN_OPERATION)

        #could only remove video_id at 0
        if video_index != 0:
            return json_fail(reason.INVALID_PARAMETER)
        logging.info('delete_video(%s:%d):%s'%(room_name,video_index,room.__class__.__name__))
        room.video_ids = room.video_ids[1:]
        room.put()
        return json_succ()
    else:
        return json_fail(reason.INVALID_PARAMETER)

@app.route('/create_room')
def create_room():
    user = users.get_current_user()
    if not user:
        return json_fail(reason.LOGIN_REQUIRED)
    else:
        room_name = flask.request.args.get('name',None)
        cover = flask.request.args.get('cover',None)
        current_time = flask.request.args.get('current_time',None)
        if room_name is None:
            return json_fail(reason.ROOM_NAME_REQUIRED)
        room = Room.fetch_by_name(room_name)
        logging.info('create_room(%s):%s'%(room_name,room.__class__.__name__))
        if room is not None:
            return json_fail("Room name already exist")
        room = Room(creator_email=user.email(), name=room_name)
        if current_time is not None and len(current_time)>0:
            room.current_time=int(current_time)
        if cover is not None and len(cover)>0:
            room.cover=cover
        room.put()
        return json_succ()

@app.route('/delete_room/<room_name>')
def delete_room(room_name):
    user = users.get_current_user()
    if not user:
        return json_fail(reason.LOGIN_REQUIRED)
    else:
        room = Room.fetch_by_name(room_name)
        logging.info('delete_room(%s):%s'%(room_name,room.__class__.__name__))
        if room is not None:
            room.key.delete()
            return json_succ()
        else:
            return json_fail(reason.NO_ROOM_FOUND, room_name)

@app.route('/room_list')
def room_list():
    user = users.get_current_user()
    rooms = []
    if not user:
        rooms = Room.fetch_all_anonymous()
    else:
        rooms = Room.fetch_all()
    return json_response([room.to_dict() for room in rooms])

@app.route('/current_time/<room_name>')
def current_time(room_name):
    room = Room.fetch_by_name(room_name)
    if room is None:
        return json_fail(reason.NO_ROOM_FOUND)
    return json_response({"current_time":int(room.current_time)})  

@app.route('/roundtrip')
@app.route('/roundtrip/<server_timestamp>')
def roundtrip(server_timestamp=None):
    if server_timestamp is None:
        return json_response({"server_timestamp":float(time.time())})
    else:
        roundtrip = time.time()-float(server_timestamp)
        return json_response({"roundtrip":float(roundtrip)})        

@app.route('/pause/<room_name>/<current_time>')
def pause(room_name, current_time):
    room = Room.fetch_by_name(room_name)
    if room is None:
        return json_fail(reason.NO_ROOM_FOUND)
    room.state="PAUSED"
    room.current_time = int(current_time)
    room.put()
    return json_succ()

@app.route('/play/<room_name>/<current_time>')
def play(room_name, current_time):
    room = Room.fetch_by_name(room_name)
    if room is None:
        return json_fail(reason.NO_ROOM_FOUND)
    room.state="PLAYING"
    room.current_time = int(current_time)
    room.put()
    return json_succ()

@app.errorhandler(400)
def invalid_parameter(error):
    return flask.Response('Ajax API raises invalid parameter error.', 400)

@app.errorhandler(401)
def require_login(error):
    logging.info('401:%s' % flask.request.referrer)
    login_url = users.create_login_url(flask.request.referrer)
    return flask.Response('Ajax APIs requires user to <a href="%s">login</a> first.' % login_url, 401, 
        {'WWWAuthenticate':'Basic realm="Login Required"','LoginUrl':login_url})

@app.errorhandler(404)
def page_not_found(error):
    """Return a custom 404 error."""
    return flask.Response('Sorry, nothing at this URL.', 404)

if __name__ == '__main__':
    app.run()