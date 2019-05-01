# chatapp

use command 

```
npm install
```

then you will run the first public server using this command

```
Node publicapp.js
```
in case you are going to use private chat you will run two times the next command and change the port in the localapp.js line:9 to simulate two persons

```
node localapp.js
```

you will enter in the dialoug box
- your username
- your password
- name:thenameofthepersontochatwith
and the same for the other user who wants to chat with you

in case you are going to use group chat you will run as much localapp.js as you want(change ports) but the first one which is the admin will enter
- his name
- his password
- room:nameoftheroom,nameofperson1,nameofperson2,...etc

and the rest of the members will enter:

- name
- password
- room:nameoftheroom
