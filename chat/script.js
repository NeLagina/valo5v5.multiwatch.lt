
const chatContainer = document.getElementById("chat");
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const CHANNEL = urlParams.get(`CHANNEL`);//id 37558817
const BROADCASTER_ID = urlParams.get(`BROADCASTER_ID`);// Lturepublic  example
const USER_NAME = "NeLagina"
const USER_PASSWORD = "oauth:m4ysykshbvi4xhnkhzu5aho4z0i8wg"
let badgeMap = {};
let emoteMap = {};
const debug = true
// Load 7TV 
fetch(`https://7tv.io/v3/users/twitch/${BROADCASTER_ID}`)
  .then(res => res.json())
  .then(data => {
    const emotes = data.emote_set?.emotes || [];
    for (const emote of emotes) {
      emoteMap[emote.name] = `${emote.data.host.url}/1x.webp`;
    }
    if (debug) {
      console.log("✅ 7TV emotes loaded");
      console.log(`https://7tv.io/v3/users/twitch/${BROADCASTER_ID}`);
    }
  });

// Load GB
fetch("GlobalBadges.json")
  .then(res => res.json())
  .then(data => {
    for (const badgeSet of data.data) {
      const setId = badgeSet.set_id;
      badgeMap[setId] = badgeMap[setId] || {};
      for (const version of badgeSet.versions) {
        badgeMap[setId][version.id] = version.image_url_1x;
      }
    }
    if (debug) {
      console.log("✅ Global badges loaded");
    }
  });
// Load TW
fetch("TwitchEmotes.json")
  .then(res => res.json())
  .then(data => {
    for (const badgeSet of data.data) {
      const setId = badgeSet.set_id;
      badgeMap[setId] = badgeMap[setId] || {};
      for (const version of badgeSet.versions) {
        badgeMap[setId][version.id] = version.image_url_1x;
      }
    }
    if (debug) {
      console.log("✅ Channel badges loaded");
    }
  });




function sendMessage() {
  const msg = document.getElementById("chatInput").value;
  client.say(CHANNEL, msg);
  addMessage(USER_NAME, msg)
}

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: USER_NAME, 
    password: USER_PASSWORD 
  },
  connection: { secure: true, reconnect: true },
  channels: [CHANNEL]
});

client.connect();

client.on("message", (channel, userstate, message, self) => {
  if (self) return;
  if (userstate.badges == null) {
    userstate.badges = {}
  }
  addMessage(userstate["display-name"], message, userstate.badges, userstate.emotes);
});

function addMessage(username, message, badges = {}, emotes = {}) {

  const line = document.createElement("div");
  line.classList.add("message");


  const userEl = document.createElement("span");
  userEl.classList.add("user");
  userEl.textContent = username;


  for (const [setId, versionId] of Object.entries(badges)) {
    const badgeUrl = badgeMap?.[setId]?.[versionId];
    if (badgeUrl) {
      const badgeEl = document.createElement("img");
      badgeEl.classList.add("badge");
      badgeEl.src = badgeUrl;
      badgeEl.alt = setId;
      line.appendChild(badgeEl);
    }
  }

  line.appendChild(userEl);


  const textEl = document.createElement("span");
  textEl.classList.add("text");
  textEl.innerHTML = renderMessage(message, emotes);
  line.appendChild(textEl);

  chatContainer.appendChild(line);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}


function renderMessage(message, emotes) {
  let result = [];
  let lastIndex = 0;
  let emotePositions = [];

  if (emotes) {
    for (const [emoteId, positions] of Object.entries(emotes)) {
      for (const pos of positions) {
        const [start, end] = pos.split("-").map(Number);
        emotePositions.push({
          start,
          end,
          id: emoteId,
          text: message.slice(start, end + 1)
        });
      }
    }
    emotePositions.sort((a, b) => a.start - b.start);

    for (const emote of emotePositions) {
      if (emote.start > lastIndex) {
        result.push(escapeHTML(message.slice(lastIndex, emote.start)));
      }
      const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/1.0`;
      result.push(`<img src="${emoteUrl}" class="emote" alt="${emote.text}">`);
      lastIndex = emote.end + 1;
    }
  }
  if (lastIndex < message.length) {
    result.push(escapeHTML(message.slice(lastIndex)));
  }
  return result.join(" ").split(" ").map(word => {
    if (emoteMap[word]) {
      return `<img src="${emoteMap[word]}" class="emote" alt="${word}">`;
    }
    return word;
  }).join(" ");
}
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, tag => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[tag]);
}

