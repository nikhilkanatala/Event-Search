'use strict';

var events = null;

window.addEventListener("submit", (event) => {  
    
    function sendData() {  
        let xhr = new XMLHttpRequest();
        let data = new FormData(form);

        let keyword = data.get('keyword');
        let distance  = data.get('distance');
        let category = data.get('category');
        let location = data.get('location');

        function reqListener(){
            events = this.response;
            let innerHTML = '';

            if(events){
                innerHTML = '<thead><tr>'+
                                    '<th>Date</th>'+
                                    '<th>Icon</th>'+
                                    '<th>Event</th>'+
                                    '<th>Genre</th>'+
                                    '<th>Venue</th>'+
                                '</tr></thead>'+
                                '<tbody>';

                for(let i =0; i < events.length; i++)
                {      
                    let id = events[i]['id'];
                    let localDate = events[i]['localDate'];
                    let localTime = events[i]['localTime'];
                    let icon = events[i]['icon'];
                    let event = events[i]['event'];
                    let genre = events[i]['genre'];
                    let venue = events[i]['venue'];
                    
                    innerHTML += '<tr>'+
                                '<td>'+localDate+'<br>'+localTime+'</td>'+
                                '<td><img src='+icon+' class="icon"></td>'+
                                '<td><a class="event-id" type="click" onclick="displayEvent(\''+id+'\')" value="'+id+'">'+event+'</a></td>'+
                                '<td>'+genre+'</td>'+
                                '<td>'+venue+'</td>'+
                                '</tr>';
                }            

                innerHTML += '</tbody>'
            } else {
                innerHTML = 'No Record to show'
            }
            document.getElementById('events').innerHTML  = innerHTML;

        }
        xhr.responseType = 'json';
        xhr.addEventListener("load", reqListener);
        xhr.open("GET", "/search?keyword="+keyword+"&distance="+distance+"&category="+category+"&location="+location, true);
        xhr.send();

    }

    var form = document.getElementById("event-form");
    sendData();

    event.preventDefault();

});

function displayEvent(id){
    let xhr = new XMLHttpRequest();

    function reqListener(){
        console.log(this.response);
        let event = this.response;
        var innerHTML = '<div class="event-view">'+
                            '<span class="event-header">'+event['Name']+'</span>'+
                            '<div class="event-details">'+
                                '<div class="event-breakdown">';
                                                                   
                                    
        Object.entries(event).forEach((entry) => {
            if(entry[1]){
                if(entry[0] != 'Artist/Team' && entry[0] != 'Buy Ticket At' && entry[0] != 'Seatmap' && entry[0] != 'Name'){
                    innerHTML += '<div class="detail">'+
                                '<label>'+entry[0]+'</label><br>'+
                                '<span>'+entry[1]+'</span>'+
                                '</div>';
                } else if(entry[0] == 'Artist/Team'){
                    innerHTML += '<div class="detail">'+
                            '<label>'+entry[0]+'</label><br>'+
                            '<a href="#">'+entry[1]+'</a>'+
                            '</div>';
                } else if(entry[0] == 'Buy Ticket At'){
                    innerHTML += '<div class="detail">'+
                            '<label>'+entry[0]+'</label><br>'+
                            '<a href="'+entry[1]+'">Ticketmaster</a>'+
                            '</div>';
                }
            }
        });
                                        
        innerHTML += '</div>'+
                    '<div class="venue-map">'+
                        '<img src="'+event['Seatmap']+'" class="seatmap">'+
                    '</div></div></div>';
        
        document.getElementById('event-view').innerHTML = innerHTML;
        document.getElementById('venueDetails').innerHTML = '';
        document.getElementById('showVenueDetails').innerHTML = '<span class="label-venue">Show Venue Details<br>'+
                                                                    '<button onclick="displayVenueDetails(\''+event['Venue']+'\')" class="arrow-down"></button>'+
                                                                '</span>';    
    }

    xhr.responseType = 'json';
    xhr.addEventListener("load", reqListener);
    xhr.open('GET', "/event?id="+id, true);
    xhr.send();


    console.log(id);
}

function displayVenueDetails(keyword){
    let xhr = new XMLHttpRequest();

    function reqListener(){
        let venue = this.response;
        let innerHTML = '<div class="venue-details-outer">'+
                            '<div class="venue-details-inner">'+
                                '<div class="venue-header">'+
                                    '<span class="venue-header-label">'+venue['Name']+'</span>'+
                                '</div>'+
                                '<div class="venue-details">'+
                                    '<div>'+
                                        '<form class="address">'+
                                            '<label class="address-label">Address: </label>'+
                                            '<div class="address-content">'+
                                                '<input class="address-input" type="text" value="'+venue['address']+'" readonly><br>'+
                                                '<input class="address-input" type="text" value="'+venue['City']+'" readonly><br>'+
                                                '<input class="address-input" type="text" value="'+venue['PostalCode']+'" readonly><br>'+
                                            '</div>'+
                                        '</form><br>'+
                                        '<a href="#">Open in Google Maps</a>'+
                                    '</div>'+
                                    '<div>'+
                                        '<a href="'+venue['url']+'"> More events at this venue</a>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>';
        
        document.getElementById('venueDetails').innerHTML = innerHTML;

    }

    xhr.responseType = 'json';
    xhr.addEventListener("load", reqListener);
    xhr.open('GET', "/venue?keyword="+keyword, true);
    xhr.send();
}
