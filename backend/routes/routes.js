import express from 'express'
// import Model from '../models/models.js'
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    getDay,
    subDays,
    addDays,
    getDaysInMonth
  } from 'date-fns';
  

const router = express.Router()

router.post('/hihello', (req, res)=>{
    console.log(req.body.event)
    res.send("L no")
})

router.post('/newEvent', async (req, res)=>{
    var event = req.body.event
    var token = req.body.token

    
    var res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
    });

    const data = await res.json();
    console.log('Created event:', data);

    res.send("hi")

})

router.post('/editEvent', async (req, res)=>{
    var event = req.body.event
    var token = req.body.token
    var id = req.body.id
    
    try{
        var res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${id}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event)
        });
    
        var data = await res.json();
        console.log('Created event:', data);
    
    }
    catch{
        console.log('error in editing')
        res.send('error in editing')
    }

    res.send("hi")

})

router.post('/deleteEvent', async (req, res)=>{
    var token = req.body.token
    let id = req.body.id

    var res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (res.status === 204) {
        console.log('Event deleted successfully');
    } else {
        const err = await res.json();
        console.error('Error deleting event:', err);
    }
})


router.get('/getCurrent35', (req, res)=>{
    // should return an array of 35 objects to fill the calendar monthly grid
    const now = new Date()

    const start = startOfMonth(now);
    const end = endOfMonth(now);

    let d1om = getDay(start) // 0 is sunday
    let d1oc = subDays(start, d1om)
    
    let dim = getDaysInMonth(now)
    let d35oc = addDays(end, 35-d1om-dim)

    let daysOfCal = eachDayOfInterval({start: d1oc, end: d35oc})

    res.send(JSON.stringify({daysOfCal:daysOfCal}))
    
})

router.post('/getEvents', async (req, res)=>{
    console.log(req.body.token)

    let init = {
        method: 'GET',
        async: true,
        headers: {
            'Authorization': 'Bearer ' + req.body.token,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': true
        },
        'contentType': 'json'
    };
    const det = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', init);

    const det_json = await det.json();
    const email = det_json.email

    const cal = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', init);
    const cal_json = await cal.json();

    var calendar_events = {}
    for (let i=0; i<cal_json.items.length; i++){
        if (cal_json.items[i].id == email){
            var evs = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${cal_json.items[i].id.replace('@', '%40')}/events`, init);
            var evs_json = await evs.json();
            calendar_events[i] = evs_json;
            console.log(evs_json)
        }
        else{
            var evs = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${cal_json.items[i].id.replace('@', '%40').replace('#', '%23')}/events`, init);
            var evs_json = await evs.json();
            calendar_events[i] = evs_json;
        }

       
    }


    res.send(calendar_events)
})

export default router