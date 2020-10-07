


    
const errorElement=document.getElementById('error')
const form = document.getElementById('form')
var username = document.getElementById("unameInput").value
var password = document.getElementById("pswInput").value

form.addEventListener('submit',(e)=> {
    let messages = []
    if (username === '' || username == null){
        messages.push('Please enter your username')
    }
    if (password.length<=6){
        messages.push("password must be longer than 6 characters")
    }
    if (messages.length > 0){
        e.preventDefault()
        errorElement.innerText = messages.join(', ')
    }
    else{
        console.log("your username is " + username + "and your password is " + password)
    }
})

    //const form = document.getElementById('form')
    //form.addEventListener('sub')
