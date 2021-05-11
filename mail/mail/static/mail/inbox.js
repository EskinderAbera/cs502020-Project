document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  document.querySelector('#compose-form').onsubmit = function () {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
  })
})
.then(response => response.json())
.then(result => {
        console.log(result);
        load_mailbox('sent');
    });

  };
return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    for (let email of emails){
      if (email.archived && mailbox == 'inbox') {
          // pass
        } else {
      const emailDiv = document.createElement('div');
      emailDiv.setAttribute("class", "p-3 mb-2 bg-secondary text-white");
      if (mailbox =='sent'){
      for (let recipient of email.recipients) {
         emailDiv.innerHTML = "TO: " + recipient + "<br />";
      }
        
      } else {
        emailDiv.innerHTML = "From: " + email.sender + "<br />";
      }
      //emailDiv.innerHTML += "<br />";
      emailDiv.innerHTML += "Sent on " + email.timestamp + "<br />";
      emailDiv.innerHTML += "Subject: " + email.subject + "<br />";
      document.querySelector('#emails-view').appendChild(emailDiv);
      emailDiv.addEventListener('click', () => load_email(email));     

      if(mailbox != 'sent'){
        const archiveButton = document.createElement('button');
        archiveButton.setAttribute("class", "btn btn-outline-warning");
        archiveButton.textContent = email.archived ? "Unarchive" : "Archive";
        document.querySelector('#emails-view').appendChild(archiveButton);
        archiveButton.addEventListener('click', function(){
          fetch('/emails/'+`${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: !(email.archived)
                })
              }).then(() => load_mailbox(mailbox));
        });
      } 
        }
    }    
  });  
}

function load_email (email){
document.querySelector('#read-email').style.display = 'block';
document.querySelector('#emails-view').style.display = 'none';
document.querySelector('#compose-view').style.display = 'none'; 

fetch('/emails/'+`${email.id}`)
  .then(response => response.json())
  .then(email => {
      const emailDiv = document.createElement('div');
     email.read ? emailDiv.style.backgroundColor = 'lightgray': emailDiv.style.backgroundColor = 'white';
      
      document.querySelector('#read-email').innerHTML = `<h3>${email.subject}</h3>`;
      emailDiv.setAttribute("class", "border mt-2");
      emailDiv.innerHTML += "From: " + email.sender + "<br />";
      for (let recipient of email.recipients) {
        emailDiv.innerHTML += "Recipients: " + recipient + "<br />";
      }
      emailDiv.innerHTML += "Sent on " + email.timestamp + "<br />";
           
      const bodyDiv = document.createElement('div');
      bodyDiv.setAttribute("class", "border mt-2 mb-2");
      bodyDiv.innerHTML += email.body + "<br />";
      document.querySelector('#read-email').appendChild(emailDiv);
      document.querySelector('#read-email').appendChild(bodyDiv);
      const replyButton = document.createElement('button');
      replyButton.setAttribute("class", "btn btn-outline-primary");
      replyButton.textContent='Reply';
      document.querySelector('#read-email').append(replyButton);
      replyButton.addEventListener('click', () => {
        compose_email(); // reply clicked => email composition form

        // prefill form (reply case)
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = email.subject;
        document.querySelector('#compose-body').value = email.body;
      }); 
  });

 fetch('/emails/' + `${email.id}`, {
  method: 'PUT',
  body: JSON.stringify({
      read: true
  })
})


}