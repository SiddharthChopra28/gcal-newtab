  
window.onload = () => {
    document.querySelector('#clime').addEventListener('click', ()=> {
      chrome.identity.getAuthToken({interactive: true}, async (token)=> {
        // if on brave, need to enable google login for extensions in settings
        console.log(token);
        
        const events = await fetch("http://localhost:3000/api/getEvents", {
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({token:token})
    
        })
         
        events_json = await events.json()
        console.log(events_json)
        

      });
    });
  };
