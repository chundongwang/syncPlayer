#!/usr/bin/env python
#
# Copyright 2014 Chundong Wang
#

from flask import Flask

app = Flask(__name__, static_folder='static')
app.config.update(dict(
    DEBUG=True,
    SECRET_KEY='f!>FEFGVvH7,%[yIjZUu79!9~k9nfi'
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)

@app.route('/')
def main():
    template = 'index.html'
    return render_template(template)

@app.errorhandler(404)
def page_not_found(error):
    """Return a custom 404 error."""
    return Response('Sorry, nothing at this URL.', 404)

if __name__ == '__main__':
    app.run()

#class MainHandler(webapp2.RequestHandler):
#    def get(self):
#        self.response.write('Empty hello world!')

#app = webapp2.WSGIApplication([
#    ('/', MainHandler)
#], debug=True)
