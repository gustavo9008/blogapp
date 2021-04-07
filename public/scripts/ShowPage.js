  // const readingBtn = document.getElementById("readingList");
  // const deleteBtn = document.getElementById("deleteList");
  const deleteCommentBtn = document.querySelectorAll(".delete-comment");
  const deleteReplyBtn = document.querySelectorAll(".delete-reply-comment");
  const form = document.querySelector("#submit-comment-form");
  const formReply = document.querySelectorAll(".submit-reply-form");
  const replyBtn = document.querySelectorAll(".reply-button");
  const saveCommentBtn = document.querySelectorAll(".save-comment-btn");
  const updateReplyBtn = document.querySelectorAll(".update-reply-btn");
  
  //===== adds event listener focus on textarea to show submit btn =====
  const c_textContainer = document.getElementById("comment-submit-container");
  const textarea = document.getElementById("comment-textarea");
  const hiddenBtn = document.getElementById("hidden-btn");
  textarea.addEventListener('focus', () => {
    hiddenBtn.style.display = "block";
    c_textContainer.classList.add('comment-submit-container');

  })//==========
  //===== axios send comment =====
  hiddenBtn.addEventListener('click', function(){
    if(form[0].value === ''){
      let err = "No comment was given 😢";
      displayError(err);
    }else{
      const submitCommentUrl = this.getAttribute('data-url');
      sendComment(submitCommentUrl);
    }
  });
  //=====
    function sendComment(url){ 
    let text = form[0].value;
    let comment = {
      text: text
    };
    axios.post(url, {comment}).then(function(response) {
          window.location.reload();
          
        }).catch(function (error) {
          let err = "Oh no how embarassing, we are unable to handly your resquest, try again later";
        displayError(err);
        })
  }//==========
  //===== send reply =====
  for(let i = 0; i < replyBtn.length; i++){
    replyBtn[i].addEventListener('click', function(){
      const replyForm = this.parentNode.querySelector("#reply-textarea").value;
      if(replyForm === ''){
        let err = "No reply was given 😢"
        displayError(err);
      }else{
     const submitReplyUrl = this.getAttribute('data-url');
     sendReply(submitReplyUrl, replyForm);
      }
    })
  }
    function sendReply(url, replyData){ 
    let commentReply = replyData;
    // let commentReply = {
    //   text: text
    // };
    axios.post(url, {commentReply}).then(function(response) {
          window.location.reload();
          
        }).catch(function (error) {
          let err = "Oh no how embarassing, we are unable to handly your resquest, try again later";
        displayError(err);
        })
  }//====================
  //===== update comment =====
  for(let i = 0; i < saveCommentBtn.length; i++){
    saveCommentBtn[i].addEventListener('click', function(){
      const updatedCommentForm = this.parentNode.parentNode.querySelector("#saveCommentBtn").value;
      if(updatedCommentForm === ''){
        let err = 'No update was given';
        displayError(err);
   }else{
     const updateCommentAction = this.getAttribute('data-action');
     sendUpdateComment(updateCommentAction, updatedCommentForm);
   }
    })
  }
  //=====
  function sendUpdateComment(url, commentData){ 
    let comment ={
      text: commentData
    }
    axios.put(url, {comment}).then(function(response) {
          window.location.reload();
          
        }).catch(function (error) {
          let err = "Oh no how embarassing, we are unable to handly your resquest, try again later";
        displayError(err);
        })
  }//==========
  //===== update reply comment =====
  for(let i = 0; i < updateReplyBtn.length; i++){
    updateReplyBtn[i].addEventListener('click', function(){
      const updatedReplyForm = this.parentNode.parentNode.querySelector("#update-reply-comment").value;
      if(updatedReplyForm === ''){
        let err = 'No update was given';
     displayError(err);
   }else{
     const updateReplyCommentAction = this.getAttribute('data-action');
     
     sendUpdateReply(updateReplyCommentAction, updatedReplyForm);
   }
    })
  }
  //=====
  function sendUpdateReply(url, commentData){ 
    let comment ={
      text: commentData
    }
    axios.put(url, {comment}).then(function(response) {
          window.location.reload();
          
        }).catch(function (error) {
          let err = 'oh no something went wrong, try again later';
          displayError(err);
        })
  }//==========
  
  //===== loop to add click listener for delete comment btn =====
  for(let i = 0; i < deleteCommentBtn.length; i++){
    deleteCommentBtn[i].addEventListener('click', function(){
      let commentDelete = this.getAttribute('data-href');
      let parent = this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
      parent.remove();
    axios.delete(commentDelete, {
    }).then(function(response) {
            let message = "Comment has been deleted"
            displaySuccess(message);
            // window.location.reload();
          
        }).catch(function (error) {
          let err = "Oh no how embarassing, we are unable to handly your resquest, try again later";
          displayError(err);
        })
    })
  }//==========
  //===== loop delete reply comment btn =====
  for(let i = 0; i < deleteReplyBtn.length; i++){
    deleteReplyBtn[i].addEventListener('click', function(){
    let commentDelete = this.getAttribute('data-href');
      
      let parent = this.parentNode.parentNode.parentNode.parentNode.parentNode;
    axios.put(commentDelete, {
    }).then(function(response) {
      let message = "Comment has been deleted"
      displaySuccess(message);
            parent.remove();
            // window.location.reload();
          
        }).catch(function (error) {
          let err = "Oh no how embarassing, we are unable to handly your resquest, try again later";
        displayError(err);
        })
    })
  }//==========
  //====================