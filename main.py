#!/usr/bin/env python
#
# Copyright 2014 Chundong Wang
#
import logging
import json
import flask

app = flask.Flask(__name__, static_folder='static')
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
        abort(401)
    else:
        name = request.args.get('name',None)
        cover = request.args.get('cover',None)
        room = Room(userid=user.user_id(),
                    useremail=user.email(),
                    current_time=0,
                    name=name,
                    cover=cover,
                    state="NOTSTARTED"
                    )
        room.put()

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
        abort(400)
    return json_response({"current_time":int(room.current_time)})  

@app.route('/roundtrip')
@app.route('/roundtrip/<server_timestamp>')
def roundtrip(server_timestamp=None):
    if server_timestamp is None:
        return json_response({"server_timestamp":int(time.time())})
    else:
        roundtrip = time.time()-int(server_timestamp)
        return json_response({"roundtrip":int(roundtrip)})        

@app.route('/pause/<room_name>/<current_time>')
def pause(room_name, current_time):
    room = Room.fetch_by_name(room_name)
    room.state="PAUSED"
    room.current_time = current_time
    room.put()

@app.route('/play/<room_name>/<current_time>')
def play(room_name, current_time):
    room = Room.fetch_by_name(room_name)
    room.state="PLAYING"
    room.current_time = current_time
    room.put()

@app.errorhandler(400)
def invalid_parameter(error):
    return flask.Response('Ajax API raises invalid parameter error.', 400)

@app.errorhandler(401)
def require_login(error):
    logging.info('401:%s' % request.referrer)
    return flask.Response('Ajax APIs requires user to login first.', 401, {'WWWAuthenticate':'Basic realm="Login Required"','LoginUrl':users.create_login_url(request.referrer or url_for('main'))})

@app.errorhandler(404)
def page_not_found(error):
    """Return a custom 404 error."""
    return flask.Response('Sorry, nothing at this URL.', 404)

if __name__ == '__main__':
    app.run()