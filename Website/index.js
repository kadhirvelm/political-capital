const mapping = {
    left: "Why",
    top: "What",
    right: "Who",
    bottom: "Games",
};

const extractDirection = (element) => element.id.split('-')[0];

function handleOnclickToDisplayDiv(element){
    const direction = extractDirection(element);
    hideHomeAndDisplay(mapping[direction], direction)
}

function handleOnclickToHideDiv(element){
    const direction = extractDirection(element);
    displayHomeAndHideDiv(mapping[direction], direction)
}

const oppositeMapping = {
    left: "right",
    right: "left",
    top: "bottom",
    bottom: "top",
}

function hideHomeAndDisplay(divId, direction){
    document.querySelector("#" + divId).classList.remove("hidden");
    document.querySelector("#" + divId).classList.remove("hide-" + direction);
    document.querySelector('#Home').classList.remove("display-" + oppositeMapping[direction]);

    document.querySelector("#" + divId).classList.add("slide-in-" + direction);
    document.querySelector('#Home').classList.add("hide-" + oppositeMapping[direction]);
    setTimeout(() => {
        document.querySelector("#Home").classList.add("hidden");
    }, 500)
}

function displayHomeAndHideDiv(divId, direction){
    document.querySelector("#Home").classList.remove("hidden");
    document.querySelector("#" + divId).classList.remove("slide-in-" + direction);
    document.querySelector('#Home').classList.remove("hide-" + oppositeMapping[direction]);

    document.querySelector("#" + divId).classList.add("hide-" + direction);
    document.querySelector('#Home').classList.add("display-" + oppositeMapping[direction]);
    setTimeout(() => {
        document.querySelector("#" + divId).classList.add("hidden");
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