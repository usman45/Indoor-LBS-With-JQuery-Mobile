// current selected event id;
var selectedEvent=null;

// database object
var mydb = false;

// values: "map" "calendar"
var currentView="map";

// record user's last query operation 0--none, 1--now, 2--next, 3--today, 4--week
var currentQuery=0;

// 0--no selection, 1--select for date
var dayClickMode=0;

// 0--view event info, 1--modify event, 2--add new event
var eventMode=0;

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
                                                  }                                             
                                            });
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

  // make the form editable
  $("#eventname").removeAttr("readonly");
  $("#place").removeAttr("disabled");

  // don't need to remove readonly attribute from the date
  $("#starttime").removeAttr("disabled");

  $("#endtime").removeAttr("disabled");
  $("#description").removeAttr("disabled");

  // hide button viewonmap modify and delte
  $("#hideoncreate").hide();
}

