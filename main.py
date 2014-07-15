#!/usr/bin/env python
#
# Copyright 2014 Chundong Wang
#
import logging
import json
import os
import flask
import time

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

def json_succ(extra=None):
    resp = {"result":"SUCCEED"}
    if extra is not None:
        resp["extra"]=extra
    return json_response(resp)

class reason:
    ROOM_NAME_REQUIRED=1
    EXIST_ROOM_NAME=2
    NO_ROOM_FOUND=3
    LOGIN_REQUIRED=401
    INVALID_PARAMETER=400

def json_fail(reason=None,extra=None):
    resp = {"result":"FAILED"}
    if reason is not None:
        resp["reason"]=reason
    if extra is not None:
        resp["extra"]=extra
    return json_response(resp)

def json_response(obj):
    response = flask.make_response(json.dumps(obj, cls=DateTimeEncoder))
    response.headers['Content-Type'] = 'application/json'
    response.headers['mimetype'] = 'application/json'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    return response

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
        room = Room(user_id=user.user_id(),
                    user_email=user.email(),
                    name=room_name
                    )
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