function initCalendar() {
  // Get current time
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();

  /* initialize the calendar
   * aspectRatio: determins the width-to-height aspect ratio of the calendar
   * theme: enable/disable use of jQuery UI theming
   * header: defines the buttons and title at the top of the calendar
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

