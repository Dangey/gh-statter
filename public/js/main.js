console.log('Client-side code running');

fetch('/', {method: 'GET'})
    .then(async function(response) {
      if(response.ok) {
        document.getElementById("text").innerHTML = await response.text();
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });