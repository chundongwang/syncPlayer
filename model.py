import logging
import time
import json
import cgi
from datetime import datetime

from google.appengine.ext import ndb
from google.appengine.api import memcache

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            encoded_object = int(time.mktime(obj.timetuple())*1000)
        else:
            encoded_object = json.JSONEncoder.default(self, obj)
        return encoded_object

class Room(ndb.Model):
    """Room of video playback service"""
    # current time in second
    current_time = ndb.IntegerProperty()
    created_date = ndb.DateTimeProperty(auto_now_add=True)
    user_id = ndb.StringProperty()
    user_email = ndb.StringProperty()
    name = ndb.StringProperty()
    cover = ndb.StringProperty()
    # NOTSTARTED,PLAYING,PAUSED,ENDED
    state = ndb.StringProperty()

    @classmethod
    def fetch_all(cls):
        key = '[%sAll]'%cls.__name__
        result = memcache.get(key);
        if result is None:
            result = cls.query().order(cls.created_date).fetch()
            memcache.set(key, result)
        return result

    @classmethod
    def fetch_all_anonymous(cls):
        key = '[%sAllAnony]'%cls.__name__
        result = memcache.get(key);
        if result is None:
            result = cls.query().order(cls.created_date).fetch()
            memcache.set(key, result)
        return result

    @classmethod
    def fetch_by_name(cls, name):
        key = '[%sName-%s]'%(cls.__name__,name)
        result = memcache.get(key)
        if result is None:
            result = cls.query(cls.name==name).fetch(1)[0]
            memcache.set(key, result)
        return result

    def _post_put_hook(self, future):
        match = future.get_result().get()
        memcache.delete_multi([
            '[%sAll]'%cls.__name__,
            '[%sName-%s]'%(cls.__name__,name)
            ]);
