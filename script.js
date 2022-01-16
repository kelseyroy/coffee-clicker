/* eslint-disable no-alert */

/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
  let websiteCounter = document.querySelector("#coffee_counter");
  return (websiteCounter.innerText = coffeeQty);
}

function clickCoffee(data) {
  data.coffee++;
  updateCoffeeView(data.coffee);
  renderProducers(data);
  //It says I keep failing the test: "updates the DOM to
  //reflect any newly unlocked producers". However it is
  //seems to be working fine in my browser and the information
  //when i console.dir looks as expected. Not sure what the
  //issue is here.
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
  for (let i = 0; i < producers.length; i++) {
    let currentProd = producers[i];
    if (
      currentProd.unlocked === false &&
      coffeeCount >= 0.5 * currentProd.price
    ) {
      currentProd.unlocked = true;
    }
  }
}

function getUnlockedProducers(data) {
  let producerArr = [];
  for (let i = 0; i < data.producers.length; i++) {
    let currentProd = data.producers[i];
    if (currentProd.unlocked === true) {
      producerArr.push(currentProd);
    }
  }
  return producerArr;
}

function makeDisplayNameFromId(id) {
  return id
    .toLowerCase()
    .split("_")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
  const containerDiv = document.createElement("div");
  containerDiv.className = "producer";
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <button type="button" id="buy_${producer.id}">Buy</button>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function renderProducers(data) {
  unlockProducers(data.producers, data.coffee);
  let producersArr = getUnlockedProducers(data);
  const producerContainer = document.querySelector("#producer_container");
  deleteAllChildNodes(producerContainer);
  for (let i = 0; i < producersArr.length; i++) {
    let producerDiv = makeProducerDiv(producersArr[i]);
    producerContainer.appendChild(producerDiv);
  }
}

/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
  for (let i = 0; i < data.producers.length; i++) {
    if (data.producers[i].id === producerId) {
      return data.producers[i];
    }
  }
}

function canAffordProducer(data, producerId) {
  let currentProducer = getProducerById(data, producerId);
  if (data.coffee >= currentProducer.price) {
    return true;
  } else {
    return false;
  }
}

function updateCPSView(cps) {
  const cpsCounter = document.querySelector("#cps");
  return (cpsCounter.innerText = cps);
}

function updatePrice(oldPrice) {
  return Math.floor(oldPrice * 1.25);
  //I think Math.round would be a bit more fair ;)
}

function attemptToBuyProducer(data, producerId) {
  let currentProd = getProducerById(data, producerId);
  if (canAffordProducer(data, producerId) === false) {
    return false;
  } else {
    currentProd.qty++;
    data.coffee -= currentProd.price;
    currentProd.price = updatePrice(currentProd.price);
    data.totalCPS += currentProd.cps;
    return true;
  }
}

function buyButtonClick(event, data) {
  const elementClickedOn = event.target;
  if (elementClickedOn.tagName === "BUTTON") {
    const clickedId = elementClickedOn.id;
    const clickedIdStr = clickedId.split("_").slice(1).join("_");
    if (canAffordProducer(data, clickedIdStr) === false) {
      window.alert("You’ve bean overeager! You better grind a little harder before you java chance to afford that.");
    } else {
      attemptToBuyProducer(data, clickedIdStr);
      updateCoffeeView(data.coffee);
      renderProducers(data);
      updateCPSView(data.totalCPS);
    }
  }
  // });
}

function tick(data) {
  data.coffee += data.totalCPS;
  updateCoffeeView(data.coffee);
  renderProducers(data);
}

// This was my attempt at getting it to set Items in local storage
const localStorage = window.localStorage;

setInterval(() => {
  localStorage.clear();
  localStorage.setItem("coffee", data.coffee);
  localStorage.setItem("totalCPS", data.totalCPS);
  console.log(JSON.parse(localStorage.getItem("coffee")));
}, 1000);

/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === "undefined") {
  // Get starting data from the window object
  // (This comes from data.js)
  let data = window.data;
  // This was my attempt at getting it to access local storage
  window.onload = function () {
    if (localStorage.getItem("coffee") !== null) {
      data.coffee = JSON.parse(localStorage.getItem("coffee"));
      data.totalCPS = JSON.parse(localStorage.getItem("totalCPS"));
      renderProducers(data);
      updateCoffeeView(data.coffee);
      updateCPSView(data.totalCPS);
    }
  };

  // Add an event listener to the giant coffee emoji
  const bigCoffee = document.getElementById("big_coffee");
  bigCoffee.addEventListener("click", () => clickCoffee(data));

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById("producer_container");
  producerContainer.addEventListener("click", (event) => {
    buyButtonClick(event, data);
  });

  // Call the tick function passing in the data object once per second
  setInterval(() => tick(data), 1000);
}

// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick,
  };
}
