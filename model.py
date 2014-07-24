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
    current_time = ndb.IntegerProperty(required=True,default=0)
    created_date = ndb.DateTimeProperty(auto_now_add=True)
    last_update = ndb.DateTimeProperty(auto_now=True)
    creator_email = ndb.StringProperty(required=True)
    name = ndb.StringProperty(required=True)
    cover = ndb.StringProperty()
    # NOTSTARTED,PLAYING,PAUSED,ENDED,DELETED
    state = ndb.StringProperty(default='NOTSTARTED',choices=['NOTSTARTED', 'PAUSED', 'PLAYING', 'ENDED'])
    video_ids = ndb.StringProperty(repeated=True)
    audience = ndb.StringProperty(repeated=True)

    @classmethod
    def fetch_all(cls):
        key = '[%sAll]'%cls.__name__
        logging.info('fetch_all key=%s'%key)
        result = memcache.get(key);
        if result is None:
            result = cls.query().order(cls.created_date).fetch()
            memcache.set(key, result)
        return result

    @classmethod
    def fetch_all_anonymous(cls):
        key = '[%sAllAnony]'%cls.__name__
        logging.info('fetch_all_anonymous key=%s'%key)
        result = memcache.get(key);
        if result is None:
            result = cls.query().order(cls.created_date).fetch()
            memcache.set(key, result)
        return result

    @classmethod
    def fetch_by_name(cls, name):
        key = '[%sName-%s]'%(cls.__name__,name)
        logging.info('fetch_by_name key=%s'%key)
        result = memcache.get(key)
        if result is None:
            results = cls.query(ndb.AND(cls.name==name)).fetch(1)
            if len(results) <= 0:
                return None
            result = results[0]
            memcache.set(key, result)
        return result

    def _post_put_hook(self, future):
        room = future.get_result().get()
        logging.info('_post_put_hook room.name=%s'%room.name)
        memcache.delete_multi([
            '[%sAll]'%self.__class__.__name__,
            '[%sName-%s]'%(self.__class__.__name__,room.name)
            ]);

    @classmethod
    def _pre_delete_hook(cls, key):
        room = key.get()
        logging.info('_pre_delete_hook room.name=%s'%room.name)
        memcache.delete_multi([
            '[%sName-%s]'%(cls.__name__,room.name)
            ]);
