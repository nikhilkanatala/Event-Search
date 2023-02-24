import requests, json

from geolib import geohash
from flask import Flask, render_template, request

app = Flask(__name__)

genre = {
        'Music':'KZFzniwnSyZfZ7v7nJ',
        'Sports': 'KZFzniwnSyZfZ7v7nE',
        'Arts & Theatre': 'KZFzniwnSyZfZ7v7na',
        'Film': 'KZFzniwnSyZfZ7v7nn',
        'Miscellaneous': 'KZFzniwnSyZfZ7v7n1' 
        }

@app.route('/')
def root():
    return app.send_static_file("events.html")

@app.route('/search', methods=['GET'])
def search():
    events = []

    args = request.args

    distance = '10'
    keyword = args['keyword']
    location = args['location']

    if args['distance'] != '':
        distance = args['distance']

    geocode = requests.get('https://maps.googleapis.com/maps/api/geocode/json?address='+location+'&key=AIzaSyAmdJz9Bdu1d2HdFjpNh_gFZQs6uAVl-u4').json()
    lat = geocode['results'][0]['geometry']['location']['lat']
    lng = geocode['results'][0]['geometry']['location']['lng']

    geoHash = geohash.encode(lat, lng, 7)
    if args['category'] != 'Default':
        response = requests.get('https://app.ticketmaster.com/discovery/v2/events.json?apikey=GOVjKESgIKqy9VPURGr8Gn3zvIdCLMLg'+ '&keyword='+keyword+'&segmentId='+genre[args['category']]+'%20&radius='+distance+'&unit=miles'+'&geoPoint='+geoHash)
    else:
        response = requests.get('https://app.ticketmaster.com/discovery/v2/events.json?apikey=GOVjKESgIKqy9VPURGr8Gn3zvIdCLMLg'+ '&keyword='+keyword+'%20&radius='+distance+'&unit=miles'+'&geoPoint='+geoHash)

    response = response.json()
    
    if '_embedded' in response:
        response = response['_embedded']['events']
    
    for i, event in enumerate(response) :
        val = { 'id': event['id'],
                'localDate': event['dates']['start']['localDate'], 
                'localTime': event['dates']['start']['localTime'] if 'localTime' in event['dates']['start']  else '00:00:00',
                'icon': event['images'][0]['url'],
                'event': event['name'],
                'genre': event['classifications'][0]['segment']['name'] if event['classifications'][0]['segment']['name'] != 'Undefined' else '' ,
                'venue': event['_embedded']['venues'][0]['name']
                        }
        events.append(val)
    
    events = json.dumps(events[:20])

    return events

@app.route('/event', methods=['GET'])
def getEvent():
    attractions = []
    genre = []

    args = request.args

    id = args['id']

    response = requests.get('https://app.ticketmaster.com/discovery/v2/events/'+id+'?apikey=GOVjKESgIKqy9VPURGr8Gn3zvIdCLMLg')
    event = response.json()

    if 'attractions' in event['_embedded']:
        for attraction in event['_embedded']['attractions']:
            attractions.append((attraction['name'], attraction['url'] if 'url' in attraction else ''))

    classifications = event['classifications'][0]
    for key in classifications:
        if key in ('genre', 'subGenre', 'segment', 'subType', 'type') and classifications[key]['name'] != "Undefined":
            genre.append(classifications[key]['name'])

    priceRanges = ''
    if 'priceRanges' in event:
        min = str(event['priceRanges'][0]['min'])
        max = str(event['priceRanges'][0]['max'])
        currency = event['priceRanges'][0]['currency']

        priceRanges = min+' - '+max+' '+currency 

    genre = " | ".join(genre)   

    val = { 'Name': event['name'],
            'Date': event['dates']['start']['localDate']+' '+(event['dates']['start']['localTime'] if 'localTime' in event['dates']['start']  else '00:00:00'),
            'Artist/Team': attractions,
            'Venue': event['_embedded']['venues'][0]['name'],
            'Genres': genre,
            'Price Ranges': priceRanges,
            'Ticket Status': event['dates']['status']['code'],
            'Buy Ticket At': event['url'],
            'Seatmap': event['seatmap']['staticUrl'] if 'seatmap' in event else ''
    }

    event = json.dumps(val)
    
    return event

@app.route('/venue', methods=['GET'])
def getVenueDetails():
    
    args = request.args

    keyword = args['keyword']

    response = requests.get('https://app.ticketmaster.com/discovery/v2/venues?apikey=GOVjKESgIKqy9VPURGr8Gn3zvIdCLMLg&keyword='+keyword)
    venue = response.json()

    if '_embedded' in venue:
        val = { 'Name': venue['_embedded']['venues'][0]['name'],
                'Address': venue['_embedded']['venues'][0]['address']['line1'],
                'City' : venue['_embedded']['venues'][0]['city']['name'] + ', ' + venue['_embedded']['venues'][0]['state']['stateCode'],
                'PostalCode': venue['_embedded']['venues'][0]['postalCode'],
                'UpcomingEvents': venue['_embedded']['venues'][0]['url'],
                'image': venue['_embedded']['venues'][0]['images'][0]['url'] if 'images' in venue['_embedded']['venues'][0] else ''
            }

        venue = json.dumps(val)
        
        return venue

    return ''


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(debug=True)

  