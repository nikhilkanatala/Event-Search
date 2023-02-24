'use strict';

var events = null;
var order = 'desc';

window.addEventListener('load' , (event)=>{
    document.getElementById("event-form").reset();
})

function sort(param){

        if(order == 'asc'){
            order = 'desc';
            events.sort((a, b) => (a[param] > b[param]) ? 1 : -1);
        }else {
            order = 'asc';
            events.sort((a, b) => (a[param] < b[param]) ? 1 : -1);
        }

    let innerHTML = '<thead><tr>'+
                    '<th>Date</th>'+
                    '<th>Icon</th>'+
                    '<th onclick="sort(\'event\')">Event</th>'+
                    '<th onclick="sort(\'genre\')">Genre</th>'+
                    '<th onclick="sort(\'venue\')">Venue</th>'+
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
                    '<td class="date">'+localDate+'<br>'+localTime+'</td>'+
                    '<td class="image"><img src='+icon+' class="icon"></td>'+
                    '<td class="event-name"><a class="event-id" type="click" onclick="displayEvent(\''+id+'\')" value="'+id+'">'+event+'</a></td>'+
                    '<td>'+genre+'</td>'+
                    '<td class="venue-name">'+venue+'</td>'+
                    '</tr>';
    }            

    innerHTML += '</tbody>'

    document.getElementById('events').innerHTML  = innerHTML;
}

function detectLocation(){

    let xhr = new XMLHttpRequest();

    function reqListener(){
        let location = this.response;
        
        if(document.getElementById("autoDetect").checked){
            document.getElementById("location").hidden = true;
            document.getElementById("location").value = location['loc'];//+', '+location['region']+', '+location['country'];
        }else{
            document.getElementById("location").hidden = false;
            document.getElementById("location").value = ''
        }
    }


    xhr.responseType = 'json';
    xhr.addEventListener("load", reqListener);
    xhr.open('GET', "https://ipinfo.io/?token=471d92d7fe7dc4", true);
    xhr.send();
   
}

function ClearForm(){
    document.getElementById('events').innerHTML = '';
    document.getElementById('events').hidden = true;

    document.getElementById('venueDetails').innerHTML = '';
    document.getElementById('event-view').innerHTML = '';
    document.getElementById('showVenueDetails').innerHTML = '';

    document.getElementById("location").hidden = false;
    document.getElementById("location").value = ''
};

window.addEventListener("submit", (event) => {  
    
    document.getElementById('venueDetails').innerHTML = '';
    document.getElementById('event-view').innerHTML = '';
    document.getElementById('showVenueDetails').innerHTML = '';
    function sendData() {  
        let xhr = new XMLHttpRequest();
        let data = new FormData(form);

        let keyword = data.get('keyword');
        let distance  = data.get('distance');
        let category = data.get('category');
        let location = data.get('location');

        function reqListener(){
            events = this.response;
            // console.log(events);
            let innerHTML = '';

            if(events){

                events.sort((a, b) => (a['event'] > b['event']) ? 1 : -1);

                innerHTML = '<thead><tr>'+
                            '<th>Date</th>'+
                            '<th>Icon</th>'+
                            '<th onclick="sort(\'event\')">Event</th>'+
                            '<th onclick="sort(\'genre\')">Genre</th>'+
                            '<th onclick="sort(\'venue\')">Venue</th>'+
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
                                '<td class="date">'+localDate+'<br>'+localTime+'</td>'+
                                '<td class="image"><img src='+icon+' class="icon"></td>'+
                                '<td class="event-name"><a class="event-id" type="click" onclick="displayEvent(\''+id+'\')" value="'+id+'">'+event+'</a></td>'+
                                '<td>'+genre+'</td>'+
                                '<td class="venue-name">'+venue+'</td>'+
                                '</tr>';
                }            

                innerHTML += '</tbody>'
            } else {
                innerHTML = '<thead><tr><th class="empty">No Records found</th></tr><thead>'
            }
            document.getElementById('events').hidden  = false;
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
        let event = this.response;
        document.getElementById('showVenueDetails').innerHTML = '';
        var innerHTML = '<div class="event-view">'+
                            '<span class="event-header">'+event['Name']+'</span>'+
                            '<div class="event-details">'+
                                '<div class="event-breakdown">';
                                                                   
                                    
        Object.entries(event).forEach((entry) => {
            if(entry[1]){
                if(entry[0] != 'Artist/Team' && entry[0] != 'Buy Ticket At' && entry[0] != 'Seatmap' && entry[0] != 'Name' && entry[0] != 'Ticket Status'){
                    if(entry[1] != ''){
                        innerHTML += '<div class="detail">'+
                                    '<label class="event-label">'+entry[0]+'</label>'+
                                    '<span class="event-value">'+entry[1]+'</span>'+
                                    '</div>';
                    }
                }else if(entry[0] == 'Ticket Status'){
                    innerHTML += '<div class="detail">'+
                    '<label class="event-label">'+entry[0]+'</label>';
                    
                    if (entry[1] == 'onsale')   innerHTML += '<input type="button" value="On Sale" id="onsale">'+'</div>';
                    if (entry[1] == 'offsale')  innerHTML += '<input type="button" value="Off Sale" id="offsale">'+'</div>';
                    if (entry[1] == 'rescheduled')  innerHTML += '<input type="button" value="Rescheduled" id="rescheduled">'+'</div>';
                    if (entry[1] == 'postponed')    innerHTML += '<input type="button" value="Postponed" id="postponed">'+'</div>';
                    if (entry[1] == 'cancelled')    innerHTML += '<input type="button" value="Cancelled" id="cancelled">'+'</div>';


                    
                } else if(entry[0] == 'Artist/Team' && entry[1].length > 0){

                    innerHTML += '<div class="detail">'+
                                 '<label class="event-label">'+entry[0]+'</label>';
                                 
                    var i = 0;
                    for(i=0; i<entry[1].length-1; i++){
                        if(entry[1][i][1] != '') innerHTML += '<a href="'+entry[1][i][1]+'" target="_blank">'+entry[1][i][0]+'</a> | ';
                        if(entry[1][i][1] == '') innerHTML += '<a>'+entry[1][i][0]+'</a> | ';
                    }  

                    if(entry[1][i][1] != '') innerHTML += '<a href="'+entry[1][i][1]+'" target="_blank">'+entry[1][i][0]+'</a></div>';
                    if(entry[1][i][1] == '') innerHTML += '<a>'+entry[1][i][0]+'</a></div>';


                } else if(entry[0] == 'Buy Ticket At'){
                    innerHTML += '<div class="detail">'+
                            '<label class="event-label">'+entry[0]+'</label>'+
                            '<a href="'+entry[1]+'" target="_blank">Ticketmaster</a>'+
                            '</div>';
                }
            }
        });
                                        
        innerHTML += '</div>'+
                    '<div class="venue-map">'+
                        '<img src="'+event['Seatmap']+'" class="seatmap">'+
                    '</div></div></div>';
        
        document.getElementById('event-view').innerHTML = innerHTML;

        window.scrollTo(0, document.body.scrollHeight);    

        document.getElementById('venueDetails').innerHTML = '';
        document.getElementById('showVenueDetails').innerHTML = '<span class="label-venue">Show Venue Details<br>'+
                                                                    '<button onclick="displayVenueDetails(\''+event['Venue']+'\')" class="arrow-down"></button>'+
                                                                '</span>';    
                                           
    }

    xhr.responseType = 'json';
    xhr.addEventListener("load", reqListener);
    xhr.open('GET', "/event?id="+id, true);
    xhr.send();

}

function displayVenueDetails(keyword){

    let xhr = new XMLHttpRequest();

    function reqListener(){
        let venue = this.response;
        console.log(this.response);

        let innerHTML = '<div class="venue-details-outer">'+
                            '<div class="venue-details-inner">'+
                                '<div class="venue-header">'+
                                    '<span class="venue-header-label">'+venue['Name']+'<hr></span>'+
                                '</div>';

        if(venue['image'] != '') innerHTML += '<div class="venue-header"><img src="'+venue['image']+'"></div>';
        
        innerHTML += '<div class="venue-details">'+
                        '<div id="address">'+
                            '<form class="address">'+
                                '<div class="address-content">'+
                                    '<label class="address-label">Address: </label>';
                       
                       
        if(venue['address'] != 'undefined') innerHTML += '<input class="address-input" type="text" value="'+venue['Address']+'" readonly><br>';

        innerHTML +=    '<input class="address-input region" type="text" value="'+venue['City']+'" readonly><br>'+
                        '<input class="address-input region" type="text" value="'+venue['PostalCode']+'" readonly><br>'+
                        '</div></form><br>'+
                        '<a href="'+'https://www.google.com/maps/search/?api=1&query='+venue['Address']+'+'+venue['City']+'" target="_blank">Open in Google Maps</a>'+
                    '</div>'+
                    '<div id="moreEvents">'+
                        '<a href="'+venue['UpcomingEvents']+'" target="_blank"> More events at this venue</a>'+
                    '</div></div></div></div>';
        
        document.getElementById('showVenueDetails').innerHTML = '';                        
        document.getElementById('venueDetails').innerHTML = innerHTML;
        window.scrollTo(0, document.body.scrollHeight);

    }

    xhr.responseType = 'json';
    xhr.addEventListener("load", reqListener);
    xhr.open('GET', "/venue?keyword="+keyword, true);
    xhr.send();
}
