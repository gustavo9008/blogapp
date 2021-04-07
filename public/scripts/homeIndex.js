    
    // clickable card 
    const card = document.querySelectorAll('.link-card');
    const clickableElements = document.querySelectorAll(".clickable");

clickableElements.forEach((ele) =>
ele.addEventListener("click", (e) => e.stopPropagation())
);

    for (let i = 0; i < card.length; i++){
        card[i].addEventListener("click", function() {
            // link to be trigger
            let link = this.querySelectorAll(".article-link");
            const isTextSelected = window.getSelection().toString();
            if (!isTextSelected) {
                link[0].click();
            }
            
    });
    }    
    