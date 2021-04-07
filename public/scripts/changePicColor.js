 // axios send data funtion
 function sendData(type, url, data){
    axios({
    method: type,
    url: url,
    data: data
  }).then(function(response) {
            
            if(response.data.deleteResponse === true){
              window.location.href = "/blogs";
            } else {
              window.location.reload();
            }
            
            
          }).catch(function (error) {
            let err = "oh no something broke, we are fixing it, try again later"
            displayError(err);
          })
        }
// =========
changeColorBtn.addEventListener('click',function(){
    newColorpic = generateRandomColors(3);
    colorCircle.style.backgroundColor = newColorpic[0];
    colorCircle.style.backgroundImage = `linear-gradient(225deg, ${newColorpic[0]} 0%, ${newColorpic[1]} 50%, ${newColorpic[2]} 100%)`;
    colorCircle.setAttribute('data-color', newColorpic);
    
  })
  // generated random colors
    function generateRandomColors(num){
    // make an array
    var arr = []
    // repeat num times
    for(var i = 0; i < num; i++){
        // get random color and push into arr
        arr.push(randomColor())
    }
    // return that array
    return arr;
  }
  function randomColor() {
    // pick a "red" fromm 0-255
    let r = Math.floor(Math.random() * 256);
    // pick a "green" fromm 0-255
    let g = Math.floor(Math.random() * 256);
    // pick a "blue" fromm 0-255
    let b = Math.floor(Math.random() * 256);
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }//===
  //=== funtion to display picked image ===
  var loadFile = function(event) {
      var output = document.getElementById('output');
      output.src = URL.createObjectURL(event.target.files[0]);
      output.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
      }
    };