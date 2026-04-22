import React, {useEffect} from 'react'
import Header from "./Header";
import Event from "./Event";
import axios from "axios";
import convert from "xml-js";
import 'ldrs/ring'
import { dotSpinner } from 'ldrs'

dotSpinner.register()

export default function App() {

  const [post, setPost] = React.useState(null);

  const CALENDAR_URL = import.meta.env.VITE_CALENDAR_URL
  console.log(CALENDAR_URL)

  function getData(){
    axios.get(`${CALENDAR_URL}`)
    .then(function (response) {
          const data = JSON.parse(
          convert.xml2json(response.data, { compact: true, spaces: 2 })
        );
        let events = data.responseWS.publicEventWS;
        console.log("Data retrieved successfully.");
        setPost({ events });
    })
    .catch(function (error) {
          console.log(error);
    });
  };

  useEffect(() => {
    getData(); 
    const interval = setInterval(() => {
      console.log(`Fetching data at ${new Date().toLocaleTimeString()}`);
      getData();
    }, 900000); // Fetch data every 15 minutes
    return () => clearInterval(interval);
  }, []);

  if (!post) return (
    <div>
      <div class="note-container">
        <h2>Events</h2>
        <div id="upcoming" class="note-column">
          <div class="loading">
            <l-dot-spinner
              size="40"
              speed="0.9" 
              color="black" 
            ></l-dot-spinner>
          </div>
        </div>
      </div>
    </div>

  )

  function dateFormat(int){
    var date = new Date();
    date.setDate(date.getDate() + int);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return month + '/' + day + '/' + year
  }

  const thisMonth = dateFormat(30);
  const filteredWeek = post.events.filter(item => Date.parse(item.startDate._text) < Date.parse(thisMonth));

  return (
    <div>
      <div className="note-container">
        <h2>Events</h2>
        <div id="upcoming" className="note-column">
        {filteredWeek.length === 0 ? 
        <div class="note">
          <p>No upcoming events!</p>
        </div>
        :
          filteredWeek.slice(0, 15).map((event) => (
              <Event key={event.eventId._text}
              title={event.title._text}
              startTime={event.startTime._text}
              startDate={event.startDate._text}
              location={event.location._text}
              virtualEvent={event.virtualEvent._text}/>
            ))}
        </div>
      </div>
    </div>
  );
};