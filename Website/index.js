const extractDirection = (element) => element.id.split('-')[0];
const formatIntoDiv = (div) => "#" + div;

function handleChangingDivPositions(elementDirection, firstElement, secondElement){ // left, home, why
    const direction = extractDirection(elementDirection);
    hideFirstElementAndDisplaySecond(direction, formatIntoDiv(firstElement), formatIntoDiv(secondElement));
}

const oppositeMapping = {
    left: "right",
    right: "left",
    top: "bottom",
    bottom: "top",
    "top_left": "bottom_right",
    "top_right": "bottom_left",
    "bottom_left": "top_right",
    "bottom_right": "top_left",
}

function hideFirstElementAndDisplaySecond(direction, firstElement, secondElement){
    document.querySelector(secondElement).classList.remove("hidden");
    document.querySelector(secondElement).classList.add("slide-in-" + direction);
    document.querySelector(firstElement).classList.add("hide-" + oppositeMapping[direction]);
    setTimeout(() => {
        document.querySelector(firstElement).classList.add("hidden");
        document.querySelector(secondElement).classList.remove("slide-in-" + direction);
        document.querySelector(firstElement).classList.remove("hide-" + oppositeMapping[direction]);
    }, 500)
}

function handleHoverRemoveBlinker(element){
    document.querySelector("#" + element.id).classList.remove("blinker");
    fadeAllIndicators(element.id);
}

function fadeOthers(element){
    fadeAllIndicators(element.id);
}

function fadeAllIndicators(exceptElement){
    ([ 'left-arrow-home', 'top-arrow-home', 'right-arrow-home', 'bottom-arrow-home' ].forEach((id) => {
        const query = "#" + id;
        if(id !== exceptElement) {
            document.querySelector(query).classList.add("faded");
            document.querySelector(query).classList.remove("blinker");
        } else {
            document.querySelector(query).classList.remove("faded");
        }
    }))
}

function populateWhoBox(){
    var people = [ 
        {
            name: "Kadhir Manickam",
            description: "Software, Content, and Game Testing",
            linkedIn: "https://www.linkedin.com/in/kadhirmanickam/",
            picture: "https://media.licdn.com/dms/image/C5103AQHIUiVRaEVFVA/profile-displayphoto-shrink_200_200/0?e=1528228800&v=alpha&t=33Glx3CfvngbLpvXlLCOUKzITpy7kvTBr35094PZCLE",
        },
        {
            name: "Alec Kassin",
            description: "Content and Game Testing",
            linkedIn: "https://www.linkedin.com/in/aleckassin/",
            picture: "https://media.licdn.com/dms/image/C4D03AQG7k-WOvWD1Dw/profile-displayphoto-shrink_800_800/0?e=1528228800&v=alpha&t=umLQS5J2MDPbl-L88aDSHeqQDj6Ic71VyOUj9SQ3k7U",
        },
        {
            name: "Luke Walquist",
            description: "Content and Game Testing",
            linkedIn: "https://www.linkedin.com/in/lukewalquist/",
            picture: "https://media.licdn.com/dms/image/C4E03AQG4z8rLUrHQNw/profile-displayphoto-shrink_800_800/0?e=1528228800&v=alpha&t=tGo1x_P9RT8XXC0EVHpryvoTpfMPL-u3uCFvmNSh4RY",
        },
        {
            name: "Alan Yap",
            description: "Game Testing",
            linkedIn: "https://www.linkedin.com/in/alanhyap/",
            picture: "https://media.licdn.com/dms/image/C5103AQHcvUdV9SYhDg/profile-displayphoto-shrink_800_800/0?e=1528228800&v=alpha&t=bUjnETNbNBgl9f2pfdmrL3CwbH_UXr4Zjffdj5FJuvw",
        },
        {
            name: "Johnathan Sokol",
            description: "Localization",
            linkedIn: "https://www.linkedin.com/in/johnathansokol/",
            picture: "https://media.licdn.com/dms/image/C4E03AQH9MmhLqJLu6A/profile-displayphoto-shrink_800_800/0?e=1528228800&v=alpha&t=MwXTUYIDRmz3E3rNe-x1xstelzJIu29wzY4WcKUqc7E",
        },
        {
            name: "Brent Summers",
            description: "Localization",
            linkedIn: "https://www.linkedin.com/in/brentmsummers/",
            picture: "https://media.licdn.com/dms/image/C4E03AQGolJ0fWWJN7w/profile-displayphoto-shrink_800_800/0?e=1528228800&v=alpha&t=TMIi1v007RPhfsaG_0YfCgfgrrXnAXSGULcekkBlPRw",
        }
    ];
    const returnSinglePersonHTML = (singlePerson) => {
        return `
            <div style="height: 14vmin; position: relative;" class="flexbox-row who-box">
                <img class='rounded-image' src="` + singlePerson.picture + `" />
                <div class='flexbox-column'>
                    <h3 style='margin-left: 15px;'> ` + singlePerson.name + ` </h3>
                    <font style='margin-left: 15px;'> ` + singlePerson.description + `</font>
                </div>
                <a class="top-right" target="_blank" href="` +  singlePerson.linkedIn + `">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
            </div>`
    }
    const finalTableContents = "<div class='who-box-table'>" + people.map(returnSinglePersonHTML).join("") + " </div>";
    document.getElementById("WhoBox").innerHTML = finalTableContents;
}

function scrollWhoBox(){
    console.log('Reaching Scroll');
}