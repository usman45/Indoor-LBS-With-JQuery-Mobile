// current selected event id;
var selectedEvent=null;

// database object
var mydb = false;

// values: "mappage" "calendarpage"
var currentView="mappage";

// record user's last query operation 0--none, 1--now, 2--next, 3--today, 4--week
var currentQuery=0;

// 0--no selection, 1--select for date
var dayClickMode=0;

// 0--view event info, 1--modify event, 2--add new event
var eventMode=0;

// marker popups, show learning location information
var popups = [];
/*the calendar is initialized
 *
 */
function initCalendar() {
  // Get current time
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

  /* header: defines the buttons and title at the top of the calendar
   * events: events source of the calendar
   * eventClick: function triggered by clicking the event
   * dayClick: function triggered by clicking the day
   */
  var calendar = $('#calendar').fullCalendar({
                                            editable: true,
                                            header: {
                                                    left: 'prevYear,prev,next,nextYear today',
                                                    center: 'title',
                                                    right: 'month,agendaWeek,agendaDay'
                                                  },
                                             dayClick: _dayClick,
                                             eventClick: _eventClick                                                       
                                            });
} 
/** Function triggered when user click on a day.
 * date: holds a Date object for the clicked day. Also holds time set if user has clicked a slot in the agendaWeek or agendaDay views
 * allDay: false if user click on a slot in the agendaWeek or agendaDay views, otherwise true;
 * jsEvent: holds th native JavaScript event with low-level information such as click coordinates
 * view: current view object hold information name, title, start, end, etc.
 */
function _dayClick(date, allDay, jsEvent, view) {
  
}

function _eventClick(calEvent, jsEvent, view) {
  
}
/*
 * The fucntion is called when the driver creates a new pick up event. Make the form visible and editable.
 */

function onCreate() {
  eventMode=2;
  // give some initial value to some inputs
  $("#eventname").val("");
  $("#place").val("ND");
  $("#choosedate").val("");
  $("#starttime").val("08:00");
  $("#endtime").val("08:00");
  $("#description").val("");

  // hide button viewonmap modify and delte
  $("#hideoncreate").hide();
}

 /*
 * Function called when user click the done button. Insert a new record or modify the record and update the events in calendar view.
 * Update the markers on the map.
 */
function onDone() {
  $("#popup1").dialog('close');
}
  /*
   * Function called when cancel button is clicked. Cancel current edit and close the event form.
   */
  function onCancel() {
    $("#popup1").dialog('close');
  }
  /*
   * Delete a event from the data base and update both in calendar view and map view
   */
  function onDelete() {
    var strSql = 'DELETE FROM EVENTS WHERE id=' + selectedEvent.id;

    mydb.transaction(function(transaction){
      transaction.executeSql(strSql, [], nullDataHandler, errorHandler);
    });

    // remove the event from the calendar view
    $("#calendar").fullCalendar("removeEvents", selectedEvent.id);

    $("#popup1").dialog('close');
  }
      
/*
 * Done clicked after creating an event. Insert the new event to the data base and update the events in calendar view.
 * The makers on map will not be updated in this function.
 */
function createEventDone()  {

  var newLon="NULL";
  var newLat="NULL";

  if ($("#place").val() != "ND")  {
    // find the place in the xml file and get the lon lat coordinates
    var places=xmlDoc.getElementsByTagName("PLACE");

    for (var i=0; i<places.length; i++) {
      if (places[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue == $("#place").val()) {
        newLon=places[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue;
        newLat=places[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue;
        break;
      }
    }
  }

  var dateStr=$("#choosedate").val();

  // splite the date string to get year, month and date
  var date=parseInt(dateStr.split('/')[0]);
  var month=parseInt(dateStr.split('/')[1]);
  var year=parseInt(dateStr.split('/')[2]);

  var startTimeStr=$("#starttime").val();

  /**************************************************
   ** javascript parseInt bug here, always use parseInt(<text value>, 10), more details here:
   ** http://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256C85006A6604
   ***************************************************/
  var startHour=parseInt(startTimeStr.split(':')[0], 10);
  var startMin=parseInt(startTimeStr.split(':')[1], 10);

  var startDate = new Date(year, month-1, date, startHour,startMin);
  var startMinNum = Math.round(startDate.getTime()/60000);

  var endTimeStr=$("#endtime").val();
  var endHour=parseInt(endTimeStr.split(':')[0], 10);
  var endMin=parseInt(endTimeStr.split(':')[1], 10);

  var endDate = new Date(year, month-1, date, endHour, endMin);
  var endMinNum=Math.round(endDate.getTime()/60000);

  // insert new record to the data base
  var strSql='INSERT INTO EVENTS(title, place, description, longitude, latitude, allDay, year, month, date, startHour, startMin, startMinNum, endHour,endMin, endMinNum) VALUES("' + $("#title").val() + '","' + $("#place").val() + '","' + $("#description").val() + '",' + newLon + ',' + newLat + ',' + allDay + ',' + year + ',' + month + ',' + date + ',' + startHour + ',' + startMin + ',' + startMinNum + ',' + endHour + ',' + endMin + ',' + endMinNum + ')';

  mydb.transaction(function(transaction){
    transaction.executeSql(strSql, [], nullDataHandler, errorHandler);
  });

  // update events in calendar view
  $("#calendar").fullCalendar("refetchEvents");
}

/*
 * Initialize the event form. 
*/ 
function initEventForm() {
  $.getJSON("places.json", function(json) { 
    $.each(json, function(key, val) {
      $.each(val, function(id, obj){
        $.each(obj, function(v) {
          name=obj[v].NAME;
          $("#place1").append("<option>" + name + "</option>");
        });
      }); 
    });
  });
}