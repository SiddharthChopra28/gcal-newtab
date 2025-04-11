import express from 'express'
import Model from '../models/models.js'
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
    console.log(req.body    )
    res.send("L no")
})

router.post('/new', async (req, res)=>{
    console.log(req.body)
    // const data = new Model({
    //     name: req.body.name,
    //     age: req.body.age
    // })
    // try {
    //     const dataToSave = await data.save();
    //     res.status(200).json(dataToSave)
    // }
    // catch (error) {
    //     res.status(400).json({message: error.message})
    // }
    res.status(200).send("hi")

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


    res.status(200).send(calendar_events)
})

export default router