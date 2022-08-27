import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import ChatMessage from "./chat_message";
import axios from "axios";
import RTMClient from "./RtmClient";
import {UserContext} from "../../../../context";
import {v4} from 'uuid';
import {fetchIndianTime} from "../../../../helpers";
import {RTMConfig} from "../../../../database/agora/config";
import {db} from "../../../../firebase_config";
import {getRTMToken} from "../../../../database/agora/agora-functions";
import {useMediaQuery} from "react-responsive";
import {ChevronLeft} from "@material-ui/icons";

export const SEPARATOR = 'pustack_separator_its_unique_and_secret';
export const MESSAGE_TYPE = {
  connection: 'CONNECTION',
  message: 'MESSAGE'
}

let timeObj = {
  time: null,
  setTime(time) {
    this.time = time;
  }
}

const wait = (time) => new Promise(res => setTimeout(res, time));

async function fetchUserAttributes(rtm, id) {
  try {
    const attr = await rtm.client.getUserAttributes(id);
    console.log('attr - ', attr);
    return attr;
  } catch (e) {
    let snapshot = await db.collection('users')
      .doc(id)
      .get()
      .then(snapshot => {
        if(snapshot.exists) {
          return snapshot;
        }
        return null;
      })
    if(snapshot) {
      let d = snapshot.data();
      return {
        image: d.profile_url,
        name: d.name,
        isInstructor: d.is_instructor ? "1" : "0"
      }
    }
    throw new Error('Not able to fetch user attributes');
  }
}

async function genMessages(res, rtm) {
  const messages = res.messages;
  let prevMessages = [];
  for(let i = 0; i < messages.length; i++) {
    let messageObj = messages[i];
    let shouldConcat = prevMessages.length > 0 && prevMessages.at(-1).userId === messageObj.src;
    if(shouldConcat) {
      prevMessages[prevMessages.length - 1].time = prevMessages[prevMessages.length - 1].time ?? messageObj.ms;
      prevMessages[prevMessages.length - 1].setTime = function(time) {
        // console.log('this, time - ', this, time);
        this.time = time;
      };
      let {name, image} = prevMessages.at(-1).messages.at(-1);
      prevMessages[prevMessages.length - 1].messages.splice(0, 0, {name, text: messageObj.payload, userId: messageObj.src, image, id: v4(), type: MESSAGE_TYPE.message, time: new Date(messageObj.ms)});
      // console.log(prevMessages);
      continue;
    }
    const {image, name, isInstructor} = await fetchUserAttributes(rtm, messageObj.src);
    let obj = {
      type: 'MESSAGE',
      isInstructor,
      userId: messageObj.src,
      messages: [{name, text: messageObj.payload, userId: messageObj.src, isInstructor, image, id: v4(), type: MESSAGE_TYPE.message, time: new Date(messageObj.ms)}],
      time: messageObj.ms,
      setTime: function(time) {
        console.log('this, time - ', this, time);
        this.time = time;
      },
      id: v4()
    }
    prevMessages.push(obj)
  };
  return prevMessages.reverse();
}

export default function ChatContainer({rtmChannel, isInstructor}) {
  const chatMessagesScrollRef = useRef(null);

  const [user] = useContext(UserContext).user;
  // const [isInstructor] = useContext(UserContext).isInstructor;

  const [rtm, setRTM] = useState(null);
  const [messages, setMessages] = useState([]);
  const [expandChat, setExpandChat] = useState(true);
  const [animComplete, setAnimComplete] = useState(true);
  const [chatCounter, setChatCounter] = useState(0);
  const [bubbleChats, setBubbleChats] = useState([]);
  const isSmallScreen = useMediaQuery({ query: "(max-width: 900px)", orientation: 'landscape' });

  const scrollToBottom = useCallback(() => {
    if(!chatMessagesScrollRef.current) return;
    chatMessagesScrollRef.current.scrollTo({top: chatMessagesScrollRef.current.scrollHeight, behavior: 'smooth'})
  }, [chatMessagesScrollRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchMessageHistory = useCallback(async (key, uid, rtm) => {
    let i = 0, max = 3;
    async function fetchMessages() {
      i++;
      if(i > max) {
        return;
      }
      const indianTime = await fetchIndianTime();
      const queryBody = {
        "filter": {
          "destination": rtmChannel,
          "start_time": "2022-02-12T09:22:46.039Z",
          "end_time": indianTime.toISOString()
        },
        "offset": 0,
        "limit": 20,
        "order": "desc"
      }
      const queryHeaders = {
        "x-agora-token": key,
        "x-agora-uid": uid
      }
      const queryResponse = await axios.post('https://api.agora.io/dev/v2/project/' + RTMConfig.appId + '/rtm/message/history/query', queryBody, {headers: queryHeaders});
      // Response example
      // {..., data: {
      //   "limit": 20,
      //   "location": "~/rtm/message/history/query/MjIzMDA3OjEyODA5MzkyOQ==",
      //   "offset": 0,
      //   "order": "desc",
      //   "request_id": "165454_4930629562360896872",
      //   "result": "success"
      // } ... }

      const historyResponse = await axios.get('https://api.agora.io/dev/v2/project/' + RTMConfig.appId + '' + queryResponse.data.location.slice(1), {headers: queryHeaders});
      // {..., data: {
      //   "code": "ok",
      //   "messages": [
      //   {
      //     "dst": "dnd-channel",
      //     "message_type": "group_message",
      //     "ms": 1644999939488,
      //     "payload": "others",
      //     "src": "BnoDa7pqI5dT2ntSiObb9xuf6Lw2"
      //   },
      //   {
      //     "dst": "dnd-channel",
      //     "message_type": "group_message",
      //     "ms": 1644999938489,
      //     "payload": "We can have",
      //     "src": "BnoDa7pqI5dT2ntSiObb9xuf6Lw2"
      //   },...
      // ],
      //   "request_id": "165454_13306870108610070770",
      //   "result": "success"
      // }, ... }


      // TODO: Add VALIDATION
      if(historyResponse.data.code === 'ok') {
        const dataRes = historyResponse.data;
        console.log('dataRes = ', dataRes);

        if(dataRes.messages.length === 0) {
          return await fetchMessages();
        }

        return dataRes;
      } else {
        console.log('queryResponse, historyResponse - ', queryResponse, historyResponse);
        return await fetchMessages();
      }
    }

    const dataRes = await fetchMessages();

    if(dataRes.code === 'ok') {
      const messages = await genMessages(dataRes, rtm);
      setMessages(messages);
    }

  }, [rtmChannel])

  useEffect(() => {
    if(!user) return;
    if(!rtmChannel) return;
    const rtm = new RTMClient();

    setRTM(rtm);
    const accountName = user.uid;

    getRTMToken(true, accountName)
      .then(({data: {key}}) => {
        rtm.init(RTMConfig.appId)

        console.log('key - ', key);
        rtm.login(accountName, key).then(() => {
          console.log('login - ', user.name, user.profile_url, isInstructor);
          rtm._logined = true;

          rtm.client.setLocalUserAttributes({
            name: user.name,
            image: user.profile_url,
            isInstructor: isInstructor ? "1" : "0"
          }).then()

          console.log('{\n' +
            '            name: user.name,\n' +
            '            image: user.profile_url,\n' +
            '            isInstructor: isInstructor ? "1" : "0"\n' +
            '          }', {
            name: user.name,
            image: user.profile_url,
            isInstructor: isInstructor ? "1" : "0"
          });

          rtm.joinChannel(rtmChannel).then(async (c) => {
            // const view = $('<div/>', {
            //   text: rtm.accountName + ' join channel success'
            // })
            // $('#log').append(view)
            rtm.channels[rtmChannel].joined = true

            await fetchMessageHistory(key, accountName, rtm);

            handleConnectionStatus({name: user.name, image: user.profile_url, status: 'joined', isInstructor: isInstructor ? '1' : '0', id: v4(), userId: user.uid, type: MESSAGE_TYPE.connection})

            // await fetchUserAttributes(rtm, 'BuGQj0q7wFhVrjKfu9mWhx0l9Hc2');
          }).catch((err) => {
            console.error(err)
          })


        }).catch((err) => {
          console.log(err)
        })
    })
  }, [user, rtmChannel, isInstructor, fetchMessageHistory]);



  function handleConnectionStatus(statusObj) {
    function setConnectionState(prevState) {
      let isThere = prevState.some(c => c && c.users && c.users.some(d => d.userId === statusObj.userId));
      if(isThere) return prevState;
      console.log('prevState, statusObj - ', prevState, statusObj);
      let shouldConcat = prevState.length > 0 && prevState.at(-1).type === MESSAGE_TYPE.connection && statusObj.isInstructor?.toString() !== "1" && prevState.at(-1).users[0].isInstructor?.toString() !== '1';
      let m = JSON.parse(JSON.stringify(prevState));
      if(shouldConcat) {
        m[m.length - 1].users.push({name: statusObj.name, userId: statusObj.userId, image: statusObj.image, isInstructor: statusObj.isInstructor});
        return m;
      }
      m.push({type: MESSAGE_TYPE.connection, users: [{name: statusObj.name, userId: statusObj.userId, image: statusObj.image, isInstructor: statusObj.isInstructor}]});
      return m;
    }
    setMessages(setConnectionState)
  }

  useEffect(() => {
    if(!rtm) return;

    rtm.on('MemberJoined', async (data) => {
      console.log('Member joined');
      const id = data.args[0];
      const {image, name, isInstructor} = await fetchUserAttributes(rtm, id);
      console.log('MemberJoined - ', data, {image, name, isInstructor});
      if(image && name) {
        handleConnectionStatus({name, image, status: 'joined', isInstructor, id: v4(), userId: id, type: MESSAGE_TYPE.connection})
      }
      // setMessages(m => {
      //   let a = [...m];
      //   a.push({name, image, status: 'joined', id: v4(), type: MESSAGE_TYPE.connection});
      //   return a;
      // });
    });

    rtm.on('MemberLeft', async (data) => {
      const id = data.args[0];
      // const {image, name} = await rtm.client.getUserAttributes(id);
      console.log('MemberLeft - ', data);
      // setMessages(m => {
      //   let a = [...m];
      //   a.push({name, image, status: 'left', id: v4(), type: 'CONNECTION'});
      //   return a;
      // });
    })

    rtm.on('ChannelMessage', async ({ channelName, args }) => {
      const [message, memberId, serverInfo] = args
      // if (message.messageType === 'IMAGE') {
      //   const blob = await rtm.client.downloadMedia(message.mediaId)
      //   blobToImage(blob, (image) => {
      //     const view = $('<div/>', {
      //       text: ['event: ChannelMessage ', 'channel: ', channelName, ' memberId: ', memberId].join('')
      //     })
      //     $('#log').append(view)
      //     $('#log').append(`<img src= '${image.src}'/>`)
      //   })
      // } else {
      const {image, name, isInstructor} = await fetchUserAttributes(rtm, memberId);
      const msgObj = {name, text: message.text, userId: memberId, isInstructor, image, id: v4(), type: MESSAGE_TYPE.message, time: new Date(serverInfo.serverReceivedTs)};
      handleMessage(msgObj);
      setBubbleChats(c => {
        let a = c.slice(0, 2);
        a.splice(0, 0, msgObj);
        return a;
      });
      setTimeout(() => {
        let chatId = msgObj.id;
        setBubbleChats(c => {
          let a = c.slice(0, 2);
          return a.map(c => {
            if(c.id === chatId) {
              return {...c, isDeleted: true}
            }
            return c;
          });
        })
      }, 5000);
      setChatCounter(c => c + 1);
      // if(!expandChat) {
      // }
      // const view = $('<div/>', {
      //   text: ['event: ChannelMessage ', 'channel: ', channelName, ', message: ', message.text, ', memberId: ', memberId].join('')
      // })
      // $('#log').append(view)
      // }
    })
  }, [rtm])

  const handleMessage = (messageObj) => {
    function setMessageToState(prevMessages) {
      let shouldConcat = prevMessages.length > 0 && prevMessages.at(-1).userId === messageObj.userId;
      let m = JSON.parse(JSON.stringify(prevMessages));
      if(shouldConcat) {
        m[m.length - 1].time = messageObj.time;
        m[m.length - 1].setTime = function(time) {
          console.log('this, time - ', this, time);
          this.time = time;
        };
        m[m.length - 1].messages.push(messageObj);
        console.log(m);
        return m;
      }
      let obj = {
        type: 'MESSAGE',
        userId: messageObj.userId,
        messages: [messageObj],
        time: messageObj.time,
        setTime: function(time) {
          console.log('this, time - ', this, time);
          this.time = time;
        },
        isInstructor: messageObj.isInstructor,
        id: v4()
      }
      m.push(obj)
      console.log(m);
      return m;
    }
    setMessages(setMessageToState);
  }

  const handleSubmit = (e) => {
   e.preventDefault();
   // console.log(e.nativeEvent.target.elements.message.value);
    if(e.nativeEvent.target.elements.message.value.trim().length === 0) return;
   const message = e.nativeEvent.target.elements.message.value;
   const el = e.nativeEvent.target.elements.message;
    rtm.sendChannelMessage(message, rtmChannel).then((m) => {
      // const view = $('<div/>', {
      //   text: 'account: ' + rtm.accountName + ' send : ' + 'This is just a simple message' + ' channel: ' + params.channelName
      // })
      // $('#log').append(view)
      console.log('message - sent ', m);
      el.value = '';
      handleMessage({name: user.name, userId: user.uid, isInstructor: isInstructor ? '1' : '0', text: message, type: MESSAGE_TYPE.message, image: user.profile_url, id: v4()});
    }).catch((err) => {
      // Toast.error('Send message to channel ' + params.channelName + ' failed, please open console see more details.')
      console.error(err)
    })
   // sendChannelMessage(e.nativeEvent.target.elements.message.value);
  }

  function renderConnectionStatus(obj) {
    console.log(obj);
    return (
      <div className={"chat_messages-status-container" + (obj.users[0].isInstructor === '1' ? ' is_instructor' : '')}>
        <div className="chat_messages-status-container-images">
          {obj.users.slice(0,3).map(c => (
            <img className={c.isInstructor === '1' ? "is_instructor" : ""} key={c.userId} width={30} height={30} src={c.image} alt={c.name}/>
          ))}
          {obj.users.length > 3 && (
            <div style={{width: '30px', height: '30px', borderRadius: 200, backgroundColor: '#c7c7c7', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <span style={{color: '#ffffff', fontSize: '11px'}}>{obj.users.length - 3}</span>
            </div>
          )}
        </div>
        <div>
          <p>
            {obj.users.slice(0,3).map((c, ind) => (
              <span key={c.userId}>{c.name.split(' ')[0]}{ind < 2 && ind < obj.users.length - 1 ? ', ' : ' '}</span>
            ))}
            {obj.users.length <= 3 && 'joined'}
          </p>
          {obj.users.length > 3 && (
            <p style={{textAlign: 'center'}}>& {obj.users.length - 3} {'other' + (obj.users.length - 3 === 1 ? '' : 's')} joined</p>
          )}
        </div>
      </div>
    )
  }

  async function handleChatExpand(doExpand) {
    const TRANSITION_TIME = 250; // in milliseconds
    setAnimComplete(false);
    setExpandChat(doExpand);
    setChatCounter(0);
    setBubbleChats([]);
    await wait(TRANSITION_TIME);
    setAnimComplete(true);
  }

  useEffect(() => {
    if(animComplete) scrollToBottom();
  }, [animComplete])

  return (
    <div className={"chat_container" + (expandChat ? '' : ' collapse')}>
      {
        (!expandChat) && bubbleChats.map((chat, ind) => (
          // TODO: Refactor this isDeleted Filter
          <div key={chat.id} className={"chat_container--bubble" + (chat.isInstructor === '1' ? ' is_instructor' : '') + (ind === 0 ? ' first-child' : '') + (bubbleChats.filter(c => !c.isDeleted).length - 1 === ind || ind === 1 ? ' last-child' : '') + (chat.isDeleted ? " is-deleted" : "")}>
            <img src={chat.image} alt={chat.name}/>
            <div className={"chat_container--bubble-content"}>
              <p className="chat_container--bubble-content-title">
                {chat.name}
                {chat.isInstructor === '1' && <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 409.6 409.6"
                  width={15}
                  height={15}
                  style={{
                    enableBackground: "new 0 0 409.6 409.6",
                  }}
                  xmlSpace="preserve"
                >
                  <path
                    d="M204.8 20.48c-11.315 0-20.48 9.165-20.48 20.48 0 11.315 9.165 20.48 20.48 20.48s20.48-9.165 20.48-20.48c0-11.315-9.165-20.48-20.48-20.48zM40.96 348.16h327.68v40.96H40.96zM349.082 147.098c12.595 7.168 21.146 20.531 21.146 36.045 0 22.989-18.637 41.626-41.626 41.626-15.462 0-28.518-8.704-35.686-21.248 8.192-2.662 14.234-10.138 14.234-19.2 0-11.315-9.165-20.48-20.48-20.48s-20.48 9.165-20.48 20.48c0 8.653 5.427 15.974 13.056 18.995-4.096 1.382-8.448 2.202-13.056 2.202-22.989 0-41.626-18.637-41.626-41.626 0-19.712 13.722-36.096 32.051-40.448L204.8 61.44l-51.866 61.952c18.381 4.352 32.051 20.736 32.051 40.448 0 22.989-18.637 41.626-41.626 41.626-4.557 0-8.96-.819-13.056-2.202 7.629-2.97 13.056-10.291 13.056-18.995 0-11.315-9.165-20.48-20.48-20.48-11.315 0-20.48 9.165-20.48 20.48 0 9.114 6.042 16.538 14.234 19.2-7.168 12.544-20.224 21.248-35.686 21.248-22.989 0-41.626-18.637-41.626-41.626 0-15.514 8.602-28.877 21.146-36.045L0 122.88 40.96 307.2h327.68l40.96-184.32-60.518 24.218zM204.8 286.72l-41.062-41.062 41.062-41.062 41.062 41.062L204.8 286.72z"/>
                </svg>}
              </p>
              <p className="chat_container--bubble-content-desc">{chat.text}</p>
            </div>
          </div>
        ))
      }
      <div className="chat_expand-sm" onClick={() => handleChatExpand(true)}>
        {chatCounter > 0 && <div className="chat_counter">
          <span>{chatCounter}</span>
        </div>}
        <svg
          height={50}
          viewBox="0 0 32 32"
          width={50}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M28 2H4C2.346 2 1 3.346 1 5v16c0 1.654 1.346 3 3 3h3v5a1.001 1.001 0 0 0 1.625.781L15.851 24H28c1.654 0 3-1.346 3-3V5c0-1.654-1.346-3-3-3z"
            fill="#e02970"
          />
          <path
            d="M31 5v16c0 1.65-1.35 3-3 3H15.85l-7.23 5.78c-.18.15-.4.22-.62.22-.15 0-.29-.03-.43-.1-.35-.17-.57-.52-.57-.9v-4.49C16.83 21.18 24.21 12.54 25.71 2H28c1.65 0 3 1.35 3 3z"
            fill="#fc4d36"
          />
          <path
            d="M16 16H8a1 1 0 1 1 0-2h8a1 1 0 1 1 0 2zM24 12H8a1 1 0 1 1 0-2h16a1 1 0 1 1 0 2z"
            fill="#e0e0e0"
          />
          <path
            d="M25 11c0 .55-.45 1-1 1h-1.75c.38-.65.73-1.32 1.05-2h.7c.55 0 1 .45 1 1z"
            fill="#ffffff"
          />
        </svg>
      </div>
      {/*<div className={"chat_container--bubble last-child"}>*/}
      {/*  <img src='https://lh3.googleusercontent.com/a-/AOh14GhfRWRf7JuqeMryGIp0MlKh0v1gbgZGi7LXvyqq=s96-c' alt="Shivam Gupta"/>*/}
      {/*  <div className={"chat_container--bubble-content"}>*/}
      {/*    <p className="chat_container--bubble-content-title">Shivam Gupta</p>*/}
      {/*    <p className="chat_container--bubble-content-desc">This is just a sample message</p>*/}
      {/*  </div>*/}
      {/*</div>*/}
      {animComplete && (expandChat || isSmallScreen ? (
          <>
            <div className="chat_container--title">
              <h4>Live Chat</h4>
              <svg style={{cursor: 'pointer'}} onClick={() => handleChatExpand(false)} width="15" height="15" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1L1 13M13 13L1 1L13 13Z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="chat_messages" ref={chatMessagesScrollRef}>
              {/*<ChatMessage name="Saurabh Singh" text="This is just a message" image={user.profile_url} time={new Date()} />*/}
              {messages.map(c => (
                c.type === MESSAGE_TYPE.message ?
                  <ChatMessage key={c.id} time={c.time} obj={c} messages={c.messages} /> :
                  renderConnectionStatus(c)
              ))}
            </div>
            <form onSubmit={handleSubmit}>
              <input name="message" autoComplete="off" type="text" placeholder="Hit 'Enter' to send message"/>
              {/*<button>Send</button>*/}
            </form>
          </>
      ) : (
        <div className="chat_container-toggle" onClick={e => handleChatExpand(true)}>
          {chatCounter > 0 && <div className="chat_counter">
            <span>{chatCounter}</span>
          </div>}
          <svg
            height={50}
            viewBox="0 0 32 32"
            width={50}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28 2H4C2.346 2 1 3.346 1 5v16c0 1.654 1.346 3 3 3h3v5a1.001 1.001 0 0 0 1.625.781L15.851 24H28c1.654 0 3-1.346 3-3V5c0-1.654-1.346-3-3-3z"
              fill="#e02970"
            />
            <path
              d="M31 5v16c0 1.65-1.35 3-3 3H15.85l-7.23 5.78c-.18.15-.4.22-.62.22-.15 0-.29-.03-.43-.1-.35-.17-.57-.52-.57-.9v-4.49C16.83 21.18 24.21 12.54 25.71 2H28c1.65 0 3 1.35 3 3z"
              fill="#fc4d36"
            />
            <path
              d="M16 16H8a1 1 0 1 1 0-2h8a1 1 0 1 1 0 2zM24 12H8a1 1 0 1 1 0-2h16a1 1 0 1 1 0 2z"
              fill="#e0e0e0"
            />
            <path
              d="M25 11c0 .55-.45 1-1 1h-1.75c.38-.65.73-1.32 1.05-2h.7c.55 0 1 .45 1 1z"
              fill="#ffffff"
            />
          </svg>
        </div>
      ))}
    </div>
  )
}
