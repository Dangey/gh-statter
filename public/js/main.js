console.log('Client-side code running');

fetch('/examples', {method: 'GET'})
    .then(async function(response) {
      if(response.ok) {
        console.log("Response good!");
        const responseText = await response.text();
        console.log(responseText);
        document.getElementById("tab").innerHTML += responseText;
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });