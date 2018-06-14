const DAY_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

var numberModalTab = 0;

function percentageOf(num1, num2) {
  if (!isNaN(num1) && !isNaN(num2)) {
    // if the parsed values are both not NaN, return the floor of percentage
    var percentage;

    // always do smaller * 100.0 / larger
    if (num1 > num2) {
      percentage = Math.floor(num2 * 100.0 / num1);
    } else {
      percentage = Math.floor(num1 * 100.0 / num2);
    }

    return percentage;
  } else {
    // otherwise, return 0
    return 0;
  }
}


function showCalendarModal(){
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('calendar-modal');
  var drop = document.getElementById('calendar-day-select');
  var text = document.getElementById('calendar-goal-input');
  var cal = document.getElementById('week-calendar');

  text.value = cal.getElementsByTagName('p')[drop.value].innerText;

  modalBackdrop.classList.remove('hidden');
  modal.classList.remove('hidden');

  // default value for <option>: first element selected
  document.getElementById('calendar-day-select')
          .getElementsByTagName('option')[0]
          .selected = true;
}

function updateTextArea(){
  var drop = document.getElementById('calendar-day-select');
  var text = document.getElementById('calendar-goal-input');
  var cal = document.getElementById('week-calendar');

  text.value = cal.getElementsByTagName('p')[drop.value].innerText;
}

function hideModal(){
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('calendar-modal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function acceptModal(){
  var request = new XMLHttpRequest();
  var requestURL = '/calendar/update';
  request.open('POST', requestURL);

  var drop = document.getElementById('calendar-day-select');
  var text = document.getElementById('calendar-goal-input');
  var cal = document.getElementById('week-calendar');

  var requestBody = JSON.stringify({
    weekday: DAY_OF_WEEK[drop.value],
    content: text.value
  });

  request.addEventListener('load', function (event) {
    if (event.target.status === 200) {
      cal.getElementsByTagName('p')[drop.value].innerText = text.value;
    } else {
      alert("Error adding new plan: " + event.target.response);
    }
  });

  request.setRequestHeader('Content-Type', 'application/json');
  request.send(requestBody);

  hideModal();
}

function showHomeModal(){
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var goalModal = document.getElementById('goal-modal');

  modalBackdrop.classList.remove('hidden');
  goalModal.classList.remove('hidden');

  // default value for <option>: first option selected
  document.getElementById('log-activity-select')
          .getElementsByTagName('option')[0]
          .selected = true;
  document.getElementById('remove-goal-select')
          .getElementsByTagName('option')[0]
          .selected = true;

  // default value for <textarea>: empty textbox
  var goalModalInputs = goalModal.getElementsByTagName('input');
  for (var i = 0; i < goalModalInputs.length; i++) {
    goalModalInputs[i].value = '';
  }
  var goalModalTextAreas = goalModal.getElementsByTagName('textarea');
  for (var i = 0; i < goalModalTextAreas.length; i++) {
    goalModalTextAreas[i].value = '';
  }

  var firstGraphGoal = document.querySelector('.graph-goal')
                               .innerText
                               .split(' ')[0];
  document.getElementById('log-activity-goal-input').value = firstGraphGoal;
}

function updateActivityGoal(event) {
  var selectDropDown = document.getElementById('log-activity-select');
  var selectedGraph = document.getElementsByClassName('graph')[
    selectDropDown.selectedIndex
  ];
  var selectedGraphGoal = Math.floor(parseInt(
    selectedGraph.querySelector('.graph-goal').innerText
  ));

  document.getElementById('log-activity-goal-input').value = selectedGraphGoal;
}

function hideModal2(){
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('goal-modal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function appendGoalGraphContainer(description, goal, progress) {
  var goalTemplateHTML = Handlebars.templates.goal({
    description: description,
    goal: goal,
    progress: progress,
    percentage: percentageOf(goal, progress)
  });
  var graphContainer = document.querySelector('.graph-container');
  graphContainer.insertAdjacentHTML('beforeend', goalTemplateHTML);
}

function appendGoalSidebar(goalDescription) {
  var newGoalItem = document.createElement('li');
  newGoalItem.classList.add('goal-item');
  newGoalItem.innerText = goalDescription;

  document.querySelector('.goal-list').appendChild(newGoalItem);
}

function appendGoalLogActivityTab(goalDescription) {
  var newGoalOption = document.createElement('option');
  newGoalOption.text = goalDescription;

  document.getElementById('log-activity-select').add(newGoalOption);
}

function appendGoalRemoveGoalTab(goalDescription) {
  var newGoalOption = document.createElement('option');
  newGoalOption.text = goalDescription;

  document.getElementById('select-remove-goal').add(newGoalOption);
}

function removeIthGoalGraph(i) {
  document.getElementsByClassName('graph')[i].remove();
}

function removeIthGoalSidebar(i) {
  document.getElementsByClassName('goal-item')[i].remove();
}

function removeIthGoalHomeModal(i) {
  document.getElementById('log-activity-select').remove(i);
  document.getElementById('select-remove-goal').remove(i);
}

function checkGraphAreaDone() {
  var graphAreas = document.getElementsByClassName('graph-area');
  var checkMark = document.createElement('i');
  checkMark.classList.add('fas', 'fa-check');

  for (var i = 0; i < graphAreas.length; i++) {
    var graphBar = graphAreas[i].children[0];
    var graphPercent = graphAreas[i].children[1];
    if (parseInt(graphBar.style.width.replace('%', '')) >= 100) {
      graphBar.style.width = '100%';
      graphBar.style.backgroundColor = 'green';
      graphPercent.innerText = '';
      graphAreas[i].appendChild(checkMark);
    }
  }
}

function acceptModal2(){
  var request = new XMLHttpRequest();
  if (numberModalTab == 0) {
    var requestURL = '/activity/log';
    request.open('POST', requestURL);

    var selectDropDown = document.getElementById('log-activity-select');
    var description = selectDropDown.value;
    var progress = parseFloat(
      document.getElementById('log-activity-progress-input').value
    );
    var goal = parseFloat(
      document.getElementById('log-activity-goal-input').value
    );
    var percentage = percentageOf(goal, progress);
    var index = selectDropDown.selectedIndex;

    /* validate inputs */
    if (progress === '' || goal === '' || isNaN(progress) || isNaN(goal)) {
      alert('Required fields are missing');
      return;
    } else if (progress < 0 || goal < 0) {
      alert('Progress and goal must be positive');
      return;
    } else if (progress > goal) {
      alert('Progress must be smaller than goal. Try setting a new goal instead');
      return;
    }

    var targetGraph = document.getElementsByClassName('graph')[index];
    var targetGraphBar = targetGraph.querySelector('.graph-bar');
    var targetGraphPercent = targetGraph.querySelector('.graph-percent');
    var oldPercent = parseFloat(targetGraphPercent.innerText.replace('%', ''));
    var contentString = description + ' ' + progress + ' ' + 'minutes.';
    var percentage = percentage + percentageOf(goal, oldPercent);

    var requestBody = JSON.stringify({
      description: description,
      goal: goal,
      progress: progress,
      percentage: percentage,
      activity: {
        content: contentString,
        percent: percentage
      }
    });

    request.addEventListener('load', function(event) {
      if (event.target.status === 200) {
         targetGraphBar.style.width = percentage + '%';
         targetGraphPercent.innerText = percentage + '%';
         checkGraphAreaDone();
      //  document.location.reload();
      } else {
        alert('Error logging activity: ' + event.target.response);
      }
    });

    request.setRequestHeader('Content-Type', 'application/json');
    request.send(requestBody);
  }
  else if(numberModalTab == 1){
    var requestURL = '/goal/add';
    request.open('POST', requestURL);

    var description = document.getElementById('create-goal-text-input').value;
    var goal = parseFloat(
      document.getElementById('create-goal-goal-input').value
    );

    /* validate inputs */
    if (description === '' || goal === '' || isNaN(goal)) {
      alert('Required fields are missing');
      return;
    } else if (goal < 0) {
      alert('Goal must be positive');
      return;
    }

    var requestBody = JSON.stringify({
      description: description,
      goal: goal,
      progress: 0,
      percentage: 0
    });

    request.addEventListener('load', function (event) {
      if(event.target.status === 200){
        appendGoalGraphContainer(description, goal, 0);
        appendGoalSidebar(description);
        appendGoalLogActivityTab(description);
        appendGoalRemoveGoalTab(description);
      }else{
        alert('Error adding goal: ' + event.target.response);
      }
    });

    request.setRequestHeader('Content-Type', 'application/json');
    request.send(requestBody);

  }else if(numberModalTab == 2){
    var requestURL = '/goal/remove';
    request.open('POST', requestURL);

    var selectDropDown = document.getElementById('select-remove-goal');
    var description = selectDropDown.value;
    var index = selectDropDown.selectedIndex;

    var requestBody = JSON.stringify({ description: description });

    request.addEventListener('load', function (event) {
      if (event.target.status === 200){
        removeIthGoalGraph(index);
        removeIthGoalSidebar(index);
        removeIthGoalHomeModal(index);
      } else{
        alert('Error removing goal: ' + event.target.response);
      }
    });

    request.setRequestHeader('Content-Type', 'application/json');
    request.send(requestBody);
  }

  hideModal2();
}

function changeModalBody(modalTabs, i) {
  return function() {
    // visually deselect the current selected modal tab
    var selectedModalTab = document.querySelector('.modal-tab-selected');
    selectedModalTab.classList.remove('modal-tab-selected');

    // visually select this new modal tab
    modalTabs[i].classList.add('modal-tab-selected');
    numberModalTab = i;

    // select modal bodies
    var modalBodies = document.getElementsByClassName('modal-body-section');
    if (modalBodies) {
      // hide the previously selected modal body
      for (var j = 0; j < modalBodies.length ; j++) {
        if (!modalBodies[j].classList.contains('hidden')) {
          modalBodies[j].classList.add('hidden');
          break;
        }
      }
      // show the newly selected modal body
      modalBodies[i].classList.remove('hidden');
    }
  };
}

function hideModal3(){
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('user-modal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function addNewUser() {
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var userModal = document.getElementById('user-modal');
  modalBackdrop.classList.remove('hidden');
  userModal.classList.remove('hidden');
}

function createNewUser(){
  var name = document.getElementById('username-text-input').value;
  var pic = document.getElementById('profimage-text-input').value;

  var request = new XMLHttpRequest();
  var requestURL = '/user/add';
  request.open('POST', requestURL);

  var requestBody = JSON.stringify({
    "name": name,
    "profilePicUrl": pic,
    "totalProgress":[{
      "description": "Total Progress",
      "goal": "0 minutes",
      "progress": "0 minutes",
      "percentage": 0
    }],
    "goals": [],
    "days": [
      {
        "weekday": "Sunday",
        "content": ""
      },
      {
        "weekday": "Monday",
        "content": ""
      },
      {
        "weekday": "Tuesday",
        "content": ""
      },
      {
        "weekday": "Wednesday",
        "content": ""
      },
      {
        "weekday": "Thursday",
        "content": ""
      },
      {
        "weekday": "Friday",
        "content": ""
      },
      {
        "weekday": "Saturday",
        "content": ""
      }
    ],
    "activities": []
  });

  request.addEventListener('load', function (event) {
    if (event.target.status === 200) {
      changeUser(name);
    } else {
      alert("Error adding new plan: " + event.target.response);
    }
  });
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(requestBody);
  hideModal3();
}

function changeUser(userName) {
  var request = new XMLHttpRequest();
  var requestURL = '/user/change';
  request.open('POST', requestURL);

  var requestBody = JSON.stringify({name: userName});
  request.addEventListener('load', function (event) {
    if (event.target.status === 200) {
      document.location.reload();
    } else {
      alert("Error adding new plan: " + event.target.response);
    }
  });
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(requestBody);
}

window.addEventListener('DOMContentLoaded', function () {
  checkGraphAreaDone();
  var button = document.getElementById('change-planner-button');
  if(button){
    button.addEventListener('click', showCalendarModal);
  }

  var homeButton = document.getElementById('create-goal-button');
  if(homeButton){
    homeButton.addEventListener('click', showHomeModal);
  }

  var modalTabs = document.getElementsByClassName('modal-tab');
  if (modalTabs) {
    for (var i = 0; i < modalTabs.length; i++) {
      modalTabs[i].addEventListener('click', changeModalBody(modalTabs, i));
    }
  }

  var modalCloseButton = document.querySelector('#calendar-modal .modal-close-button');
  if (modalCloseButton) {
    modalCloseButton.addEventListener('click', hideModal);
  }

  var modalCancelButton = document.querySelector('#calendar-modal .modal-cancel-button');
  if (modalCancelButton) {
    modalCancelButton.addEventListener('click', hideModal);
  }

  var modalAcceptButton = document.querySelector('#calendar-modal .modal-accept-button');
  if (modalAcceptButton) {
    modalAcceptButton.addEventListener('click', acceptModal);
  }

  var modalCloseButton2 = document.querySelector('#goal-modal .modal-close-button');
  if (modalCloseButton2) {
    modalCloseButton2.addEventListener('click', hideModal2);
  }

  var modalCancelButton2 = document.querySelector('#goal-modal .modal-cancel-button');
  if (modalCancelButton2) {
    modalCancelButton2.addEventListener('click', hideModal2);
  }

  var modalAcceptButton2 = document.querySelector('#goal-modal .modal-accept-button');
  if (modalAcceptButton2) {
    modalAcceptButton2.addEventListener('click', acceptModal2);
  }

  var modalLogActivitySelect = document.getElementById('log-activity-select');
  if (modalLogActivitySelect) {
    modalLogActivitySelect.addEventListener('change', updateActivityGoal);
  }

  var modalCloseButton3 = document.querySelector('#user-modal .modal-close-button');
  if (modalCloseButton3) {
    modalCloseButton3.addEventListener('click', hideModal3);
  }

  var modalCancelButton3 = document.querySelector('#user-modal .modal-cancel-button');
  if (modalCancelButton3) {
    modalCancelButton3.addEventListener('click', hideModal3);
  }

  var modalAcceptButton3 = document.querySelector('#user-modal .modal-accept-button');
  if (modalAcceptButton3) {
    modalAcceptButton3.addEventListener('click', createNewUser);
  }

  var modalSelect = document.getElementById('calendar-day-select')
  if(modalSelect){
    modalSelect.addEventListener('change', updateTextArea);
  }


  var changeUserText = document.getElementById('user-list');
  if (changeUserText) {
    changeUserText.addEventListener('click', function(event) {
      if (event.target.innerText == 'Add a new user...') {
        addNewUser();
      }
      else {
        changeUser(event.target.innerText);
      }
    });
  }
});
