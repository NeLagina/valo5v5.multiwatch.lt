
const layoutContainer = document.getElementById("playerLayout");

let currentchat = "chat1"
let team1 = "?tw=lturepublic&tw=etasofija&tw=knok1zygis"
let team2 = "?yt=id:koJXUJexSqA:name:Šerifas&tw=vieversys97"
team = team1
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const teamvar = urlParams.get('team');
if (teamvar == "karolis") {
    team = team1
    
} else if (teamvar == "aistelio" ) {
    team = team2
}



function chatchange(B) {
  let chat = document.getElementById(B);
  let oldchat = document.getElementById(currentchat);
  oldchat.classList.add("hida");
  currentchat = B;
  chat.classList.remove("hida");
};





function createPlayer(src) {
  const iframe = document.createElement("iframe");
  iframe.className = "player";
  iframe.src = src;
  iframe.allowFullscreen = true;
  return iframe;
}



function renderLayout(sources) {
  layoutContainer.innerHTML = "";
  const count = sources.length;

  if (count === 1) {
    const wrapper = document.createElement("div");
    wrapper.className = "stream-wrapper flex-grow-1";
    wrapper.appendChild(createPlayer(sources[0]));
    layoutContainer.appendChild(wrapper);
    return;
  }

  if (count === 2) {
    const row = document.createElement("div");
    row.className = "d-flex flex-grow-1 w-100 h-100";

    sources.forEach(src => {
      const wrapper = document.createElement("div");
      wrapper.className = "stream-wrapper flex-grow-1";
      wrapper.appendChild(createPlayer(src));
      row.appendChild(wrapper);
    });

    layoutContainer.appendChild(row);
    return;
  }

  if (count === 3) {
    const grid = document.createElement("div");
    grid.className = "stream-grid-3";

    sources.forEach(src => {
      const player = createPlayer(src);
      grid.appendChild(player);
    });

    layoutContainer.appendChild(grid);
    return;
  }


  const maxCols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / maxCols);

  for (let r = 0; r < rows; r++) {
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "grid";
    rowDiv.style.width = "100%";
    rowDiv.style.flexGrow = "1";

    let streamsInRow = (r === rows - 1) ? count - maxCols * r : maxCols;
    rowDiv.style.gridTemplateColumns = `repeat(${streamsInRow}, 1fr)`;
    rowDiv.style.height = `${100 / rows}%`;

    for (let i = r * maxCols; i < r * maxCols + streamsInRow; i++) {
      if (sources[i]) {
        const player = createPlayer(sources[i]);
        player.style.width = "100%";
        player.style.height = "100%";
        rowDiv.appendChild(player);
      }
    }

    layoutContainer.appendChild(rowDiv);
  }

  layoutContainer.style.display = "flex";
  layoutContainer.style.flexDirection = "column";
  layoutContainer.style.height = "100%";
  layoutContainer.style.width = "100%";
}

function getStreamSources() {
  const urlParams = new URLSearchParams(team);
  const sources = [];

  let i = 1;
  for (const [key, value] of urlParams.entries()) {
    const namefs = 'chat' + i;
    const ciframe = document.getElementById(namefs);
    const cbiframe = document.getElementById('Cchat');

    if (!ciframe || !cbiframe) {
      console.warn(`Missing iframe or container for ${namefs}`);
      i++;
      continue;
    }

    if (key === "tw") {
      sources.push(`https://player.twitch.tv/?channel=${value}&parent=cs5v5.multiwatch.lt`);
      ciframe.src = `https://www.twitch.tv/embed/${value}/chat?darkpopout&parent=cs5v5.multiwatch.lt`;

      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'dropdown-item';
      a.textContent = value;

      a.onclick = (() => {
        const currentChat = namefs;
        return function () {
          chatchange(currentChat);
          console.log(currentChat);
        };
      })();

      li.appendChild(a);
      cbiframe.appendChild(li);

    } else if (key === "yt") {
      const parts = value.split(':');
      let id = null, name = null;
      for (let j = 0; j < parts.length - 1; j++) {
        if (parts[j] === "id") {
          id = parts[j + 1];
        } else if (parts[j] === "name") {
          name = parts[j + 1];
        }
      }

      if (id && name) {
        ciframe.src = `https://www.youtube.com/live_chat?is_popout=0&v=${id}&embed_domain=cs5v5.multiwatch.lt`;
        sources.push(`https://www.youtube.com/embed/${id}?autoplay=1&origin=cs5v5.multiwatch.lt`);

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.textContent = name;

        a.onclick = (() => {
          const currentChat = namefs;
          return function () {
            chatchange(currentChat);
          };
        })();

        li.appendChild(a);
        cbiframe.appendChild(li);
      }
    }

    i++;
  }

  return sources;
}






const streamSources = getStreamSources();

renderLayout(streamSources);
