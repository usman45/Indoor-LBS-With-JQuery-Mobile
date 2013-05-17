  function initCalendar()
      {
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
                                                     aspectRatio:0.9,
                                                     theme:true,
                                                     header: {
                                                     left: 'prev,next today',
                                                     center: 'title',
                                                     right: 'month,agendaWeek,agendaDay'
                                                     },
                                                 
                                                     events: _eventsGet,
                                                 
                                                     eventClick: _eventClick,
                                                 
                                                     dayClick: _dayClick                                                
                                                     });
      }   


      /* Get the events to be shown on the calendar. The calendar will call this function whenever it needs new events. 
       * This is triggered when the user click the next/prev or switch the calendar view
       * 
       * start & end: date objects denoting the time range of the needed events
       * callback: a function that must be called when the custom event function has generated its events
       */
      function _eventsGet(start,end,callback)
      {
          var events = [];
      
          var rangeStartMinNum = Math.round(start.getTime()/60000);
          var rangeEndMinNum = Math.round(end.getTime()/60000);
      
          var strSql = 'SELECT * FROM EVENTS WHERE startMinNum >= ' + rangeStartMinNum + ' AND startMinNum <' + rangeEndMinNum;
      
          mydb.transaction(function(transaction){
                           transaction.executeSql(strSql,[],function(transaction, results){
                                                  // fetch the events data from db and display them on the calendar
                                                  for (var i=0; i<results.rows.length; i++)
                                                  {
                                                  var startDate = new Date(results.rows.item(i).year, results.rows.item(i).month-1, results.rows.item(i).date, results.rows.item(i).startHour, results.rows.item(i).startMin);
                                                  var endDate = new Date(results.rows.item(i).year, results.rows.item(i).month-1, results.rows.item(i).date, results.rows.item(i).endHour, results.rows.item(i).endMin);
                                              
                                                  var bgColor="";
                                                  if (results.rows.item(i).place == "ND")
                                                  {
                                                  bgColor="grey";
                                                  }
                                              
                                              
                                                  events.push({
                                                              id:results.rows.item(i).id,
                                                              title:results.rows.item(i).title,
                                                              start:startDate,
                                                              end:endDate,
                                                              allDay:results.rows.item(i).allDay,
                                                              backgroundColor: bgColor
                                                              });
                                                  }
                                                  callback(events);
                                                  }, errorHandler);
                           });
      }

      /*
       * Function triggered by clicking an event.
       * event: an event object that holds the event's information(date,title,etc).
       * jsEvent: holds the native Javascript event with low-level information such as click coordinates
       * view: a view object holds current view's information (name, title, start, end, etc)
       */
      function _eventClick(event,jsEvent,view)
      {
          if (eventMode != 0)
          {
              return;
          }
      
          $("#eventinfo").show();
          $("#calendar").fullCalendar("option","aspectRatio","1.35");
      
          // show viewonmap modify and delete buttons if they are hidden
          $("#viewonmap").show();
          $("#modify").show();
          $("#delete").show();
      
          // get the event's information and fill the form
          $("#title").val(event.title);
          $("#allday").prop("checked",event.allDay)
      
          // in our case, lectures are usually finished in the same day, that means, event.start == event.end
          var dateStr=event.start.getDate() + '/' + (event.start.getMonth()+1) + '/' + event.start.getFullYear();
          $("#date").val(dateStr);
      
          var hours = event.start.getHours();
          if (hours<10)
          {
              hours = '0'+hours;
          }
          var minutes=event.start.getMinutes();
          if (minutes<10)
          {
              minutes = '0'+minutes;
          }
          var startTime=hours + ":" + minutes
      
          hours = event.end.getHours();
          if (hours<10)
          {
              hours = '0'+hours;
          }
          minutes=event.end.getMinutes();
          if (minutes<10)
          {
              minutes = '0'+minutes;
          }
          var endTime=hours+ ":" +minutes;
      
          $("#starttime").val(startTime);
          $("#endtime").val(endTime);
      
          // set the current selected event
          selectedEvent = event;
      
          // as calendar event object does not hold place and description information, get them from database 
          var strSql="SELECT * FROM EVENTS WHERE id=" + event.id;
          mydb.transaction(function(transaction){
                           transaction.executeSql(strSql,[],function(transaction, results){
                                              
                                                  //alert(results.rows.item(0).place);
                                                  $("#place").val(results.rows.item(0).place);
                                                  $("#description").val(results.rows.item(0).description);
                                                  }, errorHandler);
                           });
      }

      /*
      * Function triggered when user click on a day.
       * date: holds a Date object for the clicked day. Also holds time set if user has clicked a slot in the agendaWeek or agendaDay views
       * allDay: false if user click on a slot in the agendaWeek or agendaDay views, otherwise true;
       * jsEvent: holds th native JavaScript event with low-level information such as click coordinates
       * view: current view object hold information name, title, start, end, etc.
       */
      function _dayClick(date, allDay, jsEvent, view)
      {
          if(dayClickMode==1)
          {
            //select date for date
            var datestring=date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
        
            $("#calendar").fullCalendar("option","aspectRatio","1.35");
            $("#eventinfo").show();
            
            $("#date").val(datestring);
        
            dayClickMode=0;
          }
      }

      /*
       * Initialize the event form. 
       */
      function initEventForm() {
        // get places from the xml file, it is possible to get a remote xml file data
        xmlhttp=new XMLHttpRequest();
        xmlhttp.open("GET","places.xml",false);
        xmlhttp.send();
        xmlDoc=xmlhttp.responseXML;
    
        // add the places to the dropdown list
        var places=xmlDoc.getElementsByTagName("PLACE");
        for (var i=0; i<places.length; i++)
        {
          var name=places[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue;
          $("#place").append("<option>" + name + "</option>");
        }
    
        // the form is not shown in normal calendar view
        $("#eventinfo").hide();
      }

      // Initialize the database and create the table
      function initDB()
      {
        try
        {
            if (!window.openDatabase)
            {
                alert("not supported");
            }
            else
            {
              var dbName="MapSchedule";
              var version="1.0";
              var displayName="MapSchedule database";
              var maxSize=524288; //database size 512kb
              mydb=openDatabase(dbName, version, displayName, maxSize);
          
              // Delete the table if table exist, for test purpose only, user will never want to drop the table
          
              /*mydb.transaction(
               function(transaction){
               transaction.executeSql('DROP TABLE IF EXISTS EVENTS', [], nullDataHandler, errorHandler);
               });
               */
          
              /* create the table if table not exist
               *
               * The columns, startMinNum and endMinNum, are the number of minutes since midnight of Jan 1, 1970.
               * They are useful for event query
               */
              mydb.transaction(
                function(transaction){
                  transaction.executeSql('CREATE TABLE IF NOT EXISTS EVENTS(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, place TEXT, description TEXT, longitude FLOAT, latitude FLOAT, allDay INTEGER, year INTEGER, month INTEGER, date INTEGER, startHour INTEGER, startMin INTEGER, startMinNum INTEGER, endHour INTEGER, endMin INTEGER, endMinNum INTEGER)', [], nullDataHandler, errorHandler);
                }
              );
            }
          }
          catch (e)
          {
            alert("Error:"+e);
          }
      }

      /*
       ** Database operation callback functions
       */

      // db error handler - called when error occurs in excuting the sql sentence
      errorHandler = function(transaction, error) 
      {
        alert(error);
        return true;
      }
      
      // null db data handler - called when no data obtained in excuting the sql sentence (for example: insert, create sentence)
      nullDataHandler = function(transaction, results) {}

      // data handler - called when do queries or select sentence and display the results on the map
      // results: stores the query records
      displayDateHandler = function(transaction, results)
      {
        // clear the previous markers
        markers.clearMarkers();
    
        //clear popups
        for (var i=0; i<popups.length; i++)
        {
            map.removePopup(popups[i]);
        }
    
        var longitudes = [];
        var latitudes = [];
        var places = [];
        var markerContents = [];
    
        var k = 0;
        for (var i=0; i<results.rows.length; i++)
        {
          if (results.rows.item(i).place == "ND")
          {
            continue;
          }
      
          // get the data
          var startHour = results.rows.item(i).startHour;
          var startMin = results.rows.item(i).startMin;
          var endHour = results.rows.item(i).endHour;
          var endMin = results.rows.item(i).endMin;
      
          // to make sure the time shows in a standard way i.e. hh:mm
          if (startHour<10)
          {
            startHour = '0'+startHour;
          }
      
          if (startMin<10)
          {
            startMin = '0'+startMin;
          }
      
          if (endHour<10)
          {
            endHour = '0'+endHour;
          }
      
          if (endMin<10)
          {
            endMin = '0'+endMin;
          }
      
          var isNewPlace = true;
          for (var j=0; j<places.length; j++)
          {
            if (places[j] == results.rows.item(i).place)
            {
              // if it is a place already show on the map, add the new event's information to the same maker popup
              isNewPlace=false;
          
              markerContents[j] += "<hr><b>"+results.rows.item(i).title + 
              "</b><br> <table><tr><td>Place</td><td align='right'>" + results.rows.item(i).place + 
              "</td></tr> <tr><td>Date</td><td align='right'>" + results.rows.item(i).date + 
              "/" + results.rows.item(i).month + "/" + results.rows.item(i).year + 
              "</td></tr> <tr><td>From</td><td align='right'>" + startHour + 
              ":" + startMin + "</td></tr> <tr><td>To</td><td align='right'>" + endHour +
              ":" + endMin + 
              "</td></tr></table>";
              break;
            }           
          }
      
          // if it is a new place, create a new marker on the map
          if (isNewPlace)
          {
            places[k] = results.rows.item(i).place;
            longitudes[k] = results.rows.item(i).longitude;
            latitudes[k] = results.rows.item(i).latitude;
            markerContents[k] = "<b>"+results.rows.item(i).title + 
            "</b><br> <table><tr><td>Place</td><td align='right'>" + results.rows.item(i).place + 
            "</td></tr> <tr><td>Date</td><td align='right'>" + results.rows.item(i).date + 
            "/" + results.rows.item(i).month + 
            "/" + results.rows.item(i).year + 
            "</td></tr> <tr><td>From</td><td align='right'>" + startHour + 
            ":" + startMin + 
            "</td></tr> <tr><td>To</td><td align='right'>" + endHour + 
            ":" + endMin + 
            "</td></tr></table>";   
            k++;
          }
        }
    
        for (var i=0; i<places.length; i++)
        {
          // add markers on map and add popups with the marker
          addMarker(places[i], longitudes[i], latitudes[i], markerContents[i], i);
        }
      }

      // Insert test records
      function InsertRecords()
      {
        try
        {
          var date1_s = new Date(2011,7,2,10,30);
          var date1_e = new Date(2011,7,2,12,0);
      
          var date2_s = new Date(2011,7,5,16,30);
          var date2_e = new Date(2011,7,5,19,0);
      
          var date3_s = new Date(2011,7,7,18,30);
          var date3_e = new Date(2011,7,7,20,0);
      
          mydb.transaction(
            function(transaction){
              transaction.executeSql('INSERT INTO EVENTS(title, place, description, longitude, latitude, allDay, year, month, date, startHour, startMin, startMinNum, endHour,endMin, endMinNum) VALUES("GIS ABC", "1B","Basic GIS course", 24.827567, 60.185209, 1, 2011, 8, 2, 10, 30,' + Math.round(date1_s.getTime()/60000)  + ', 12, 0,' + Math.round(date1_e.getTime()/60000) + ');', [], nullDataHandler, errorHandler);
              transaction.executeSql('INSERT INTO EVENTS(title, place, description, longitude, latitude, allDay, year, month, date, startHour, startMin, startMinNum, endHour,endMin, endMinNum) VALUES("Spatial Database", "1T","", 24.826567, 60.187209, 0, 2011, 8, 5, 16, 30,' + Math.round(date2_s.getTime()/60000)  + ', 19, 0,' + Math.round(date2_e.getTime()/60000) + ');', [], nullDataHandler, errorHandler);
              transaction.executeSql('INSERT INTO EVENTS(title, place, description, longitude, latitude, allDay, year, month, date, startHour, startMin, startMinNum, endHour,endMin, endMinNum) VALUES("Cartography", "1G","", 24.826567, 60.184209, 0, 2011, 8, 7, 18, 30,' + Math.round(date3_s.getTime()/60000)  + ',20, 0,' + Math.round(date3_e.getTime()/60000) + ');', [], nullDataHandler, errorHandler);
            }
          );
        }
        catch (e)
        {
            alert("Error:"+e.code);
        }
      }

      /*
       * Menu button functions
       */

      /* 
       * Show the learning location where the user should be at the moment
       */
      function onNow()
      {
          // Get current time
          var date = new Date();
          // get the number of minutes since midnight of Jan 1, 1970
          var minNum = Math.round(date.getTime()/60000);
      
          // select the on going lecture event
          var strSql = 'SELECT * FROM EVENTS WHERE startMinNum <=' + minNum + ' AND endMinNum >=' + minNum + ' ORDER BY startMinNum ASC';
      
          mydb.transaction(function(transaction){
            transaction.executeSql(strSql, [], displayDateHandler, errorHandler);
          });
      
          // remember the query
          currentQuery = 1;
      }

      /* 
       * Show the learning location where the user should go next
       */
      function onNext()
      {
          // get current time
          var date = new Date();
          // get the number of minutes since midnight of Jan 1, 1970
          var minNum = Math.round(date.getTime()/60000);
      
      
          // select the most recent learning event
          var strSql = 'SELECT * FROM EVENTS WHERE startMinNum > '+ minNum + ' ORDER BY startMinNum ASC LIMIT 1';
      
          mydb.transaction(function(transaction){
            transaction.executeSql(strSql, [], displayDateHandler, errorHandler);
          });
      
          //remember the query
          currentQuery = 2;   
      }

      /* 
       * Show today's learning locations
       */
      function onToday()
      {
          // get date today
          var currentTime = new Date();
          var year = currentTime.getFullYear();
          var month=currentTime.getMonth()+1;
          var date=currentTime.getDate();
      
          // select today's events
          var strSql = 'SELECT * FROM EVENTS WHERE year=' + year + ' and month=' + month + ' and date=' + date + ' ORDER BY startMinNum ASC';
      
      
          mydb.transaction(function(transaction){
            transaction.executeSql(strSql, [], displayDateHandler, errorHandler);
          });
      
          // remember the query
          currentQuery = 3;
      }

      /* 
       * Show the learning locations in this week
       */
      function onWeek()
      {
          // get current time
          var date = new Date();
          // set the time to 00:00 today
          date.setHours(0);
          date.setMinutes(0);
          date.setSeconds(0);
          date.setMilliseconds(0);
      
          var day=date.getDay();
      
          // a week ranges from sunday midnight to the next sunday midnight
          var weekStartMinNum = Math.round(date.getTime()/60000) - day*24*60;
          var weekEndMinNum = Math.round(date.getTime()/60000) + (7-day)*24*60;
      
          // select this week's event
          var strSql = 'SELECT * FROM EVENTS WHERE startMinNum >= ' + weekStartMinNum + ' AND startMinNum < ' + weekEndMinNum + ' ORDER BY startMinNum ASC';
      
          mydb.transaction(function(transaction){
            transaction.executeSql(strSql, [], displayDateHandler, errorHandler);
          });
      
          // remember the query
          currentQuery = 4;
      }

      /*
       * Re-do the recently done query
       */
      function queryRedo(currentQuery)
      {
          switch (currentQuery)
          {
              case 0:
                break;
              case 1:
                onNow();
                break;
              case 2:
                onNext();
                break;
              case 3:
                onToday();
                break;
              case 4:
                onWeek();
                break;
              default:
                break;
          }
      }

      /*
       * Function called when user click the done button. Insert a new record or modify the record and update the events in calendar view.
       * Update the markers on the map.
       */
      function onDone()
      {
          if (eventMode == 0)
          {
            // view info done
          }
          else if (eventMode == 1)
          {
            // modify done
            if ($("#title").val() == '')
            {
                alert("Please give event title");
                return;
            }
        
            // modify event done
            modifyEventDone();
          }
          else if (eventMode == 2)
          {
            // create done
            if ($("#title").val() == '')
            {
                // the title is required
                alert("Please give event title");
                return;
            }
        
            if ($("#date").val() == '')
            {
                // the date is required
                alert("Please give the date");
                return;
            }
        
            // create new event done
            createEventDone();
          }
      
          // set event mode to view mode (not editable)
          eventMode=0;
      
          //set the form not editable
          $("#title").attr("readonly","readonly");
          $("#place").attr("disabled", "true");
          $("#allday").attr("disabled", "true");
      
          $("#starttime").attr("disabled", "true");
      
          $("#endtime").attr("disabled", "true");
          $("#description").attr("disabled", "true");
      
          // make the calendar view fill the screen and hide the form
          $("#calendar").fullCalendar("option","aspectRatio","0.9");
          $("#eventinfo").hide();
      
          // redo most recent query to update makers on map in case modification is done to the data base
          queryRedo(currentQuery);
      }

      /*
       * Done clicked after modifying an event. Update the records in data base and update the events in calendar view.
       * The makers on map will not be updated in this function.
       */
      function modifyEventDone()
      {
          // get the data from the form
          var newLon, newLat;
      
          var dateStr=$("#date").val();
      
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
      
      
          var allDayChecked=$("#allday").is(":checked");
          var allDay=0;
          if (allDayChecked)
          {
            allDay=1;
          }
          else
          {
            allDay=0;
          }
      
          var strSql = 'UPDATE EVENTS SET title="' + $("#title").val() + '", place="' + $("#place").val() + '", description="' + $("#description").val() + '", ';
      
          if ($("#place").val() != "ND")
          {
            // find the place in the xml file and get the lon lat coordinates
            var places=xmlDoc.getElementsByTagName("PLACE");
        
            for (var i=0; i<places.length; i++)
            {
                if (places[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue == $("#place").val())
                {
                    newLon=places[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue;
                    newLat=places[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue;
                    break;
                }
            }
        
            strSql += 'longitude=' + newLon + ', latitude=' + newLat + ', ';
          }
          else
          {
            // if the place is not decided, the lon lat are set to null
            strSql += 'longitude=NULL, latitude=NULL, ';
          }
      
      
          strSql += 'allDay=' + allDay + ', year=' + year + ', month=' + month + ', date=' + date +', startHour=' + startHour + ', startMin=' + startMin +', startMinNum=' + startMinNum + ', endHour=' + endHour + ', endMin=' + endMin + ', endMinNum=' + endMinNum + ' WHERE id=' + selectedEvent.id;
      
          // update the record in the data base
          mydb.transaction(function(transaction){
            transaction.executeSql(strSql, [], nullDataHandler, errorHandler);
          });
      
          selectedEvent.title=$("#title").val();
          selectedEvent.allDay=allDayChecked;
          selectedEvent.start=startDate;
          selectedEvent.end=endDate;
      
          // if the place is not decided, the event backgroud is set to grey
          if ($("#place").val() == "ND")
          {
            selectedEvent.backgroundColor="grey";
          }
          else
          {
            selectedEvent.backgroundColor="";
          }
      
          // update event on the calendar view
          $("#calendar").fullCalendar("updateEvent",selectedEvent);
      }

      /*
       * Done clicked after creating an event. Insert the new event to the data base and update the events in calendar view.
       * The makers on map will not be updated in this function.
       */
      function createEventDone()  
      {
          var newLon="NULL";
          var newLat="NULL";
      
          if ($("#place").val() != "ND")
          {
            // find the place in the xml file and get the lon lat coordinates
            var places=xmlDoc.getElementsByTagName("PLACE");
        
            for (var i=0; i<places.length; i++)
            {
                if (places[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue == $("#place").val())
                {
                    newLon=places[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue;
                    newLat=places[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue;
                    break;
                }
            }
          }
      
          // get event's information from the form
          var allDayChecked=$("#allday").is(":checked");
          var allDay=0;
          if (allDayChecked)
          {
            allDay=1;
          }
          else
          {
            allDay=0;
          }
      
          var dateStr=$("#date").val();
      
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
       * Function called when cancel button is clicked. Cancel current edit and close the event form.
       */
      function onCancel()
      {
          // set the event to view mode
          eventMode=0;
      
          // make the form not editable
          $("#title").attr("readonly","readonly");
          $("#place").attr("disabled", "true");
          $("#allday").attr("disabled", "true");
      
          $("#starttime").attr("disabled", "true");
      
          $("#endtime").attr("disabled", "true");
          $("#description").attr("disabled", "true");
      
          // make the calendar bigger and hide the form
          $("#calendar").fullCalendar("option","aspectRatio","0.9");
          $("#eventinfo").hide();
      }
      
      /*
       * function called when onviewmap is clicked. It will show the current selected event on the map.
       */
      function onViewOnMap()
      {
          // switch to the map view
          onSwitchView();
      
          var strSql = 'SELECT * FROM EVENTS WHERE id='+selectedEvent.id;
          mydb.transaction(function(transaction){
            transaction.executeSql(strSql, [], displayDateHandler, errorHandler);
          });
      }
      
      /*
       * Delete a event from the data base and update both in calendar view and map view
       */
      function onDelete()
      {
          var strSql = 'DELETE FROM EVENTS WHERE id=' + selectedEvent.id;
      
          mydb.transaction(function(transaction){
            transaction.executeSql(strSql, [], nullDataHandler, errorHandler);
          });
      
          // remove the event from the calendar view
          $("#calendar").fullCalendar("removeEvents", selectedEvent.id);
      
          // make the calendar display bigger and hide event form
          $("#calendar").fullCalendar("option","aspectRatio","0.9");
          $("#eventinfo").hide();
      
          // redo most recent query to update makers on map in case modification is done to the data base
          queryRedo(currentQuery);
      }
      
      /*
       * Function called when user clicks the modify button. Enable the form editable.
       */
      function onModify()
      {
          eventMode=1;
      
          $("#title").removeAttr("readonly");
          $("#place").removeAttr("disabled");
          $("#allday").removeAttr("disabled");
      
          // don't need to remove readonly attribute from the date
          $("#starttime").removeAttr("disabled");
      
          //
          $("#endtime").removeAttr("disabled");
          $("#description").removeAttr("disabled");
      }
      
      /*
       * Function called when user want to create an event. Make the form visible and editable.
       */
      function onCreate()
      {
          eventMode=2;
      
          if (currentView=="map")
          {
            onSwitchView();
          }
      
          // make the calendar smaller and show the form
          $("#eventinfo").show();
          $("#calendar").fullCalendar("option","aspectRatio","1.35");
      
          // hide button viewonmap modify and delte
          $("#viewonmap").hide();
          $("#modify").hide();
          $("#delete").hide();
      
          // give some initial value to some inputs
          $("#title").val("");
          $("#place").val("ND");
          $("#allday").attr("checked",false);
          $("#date").val("");
          $("#starttime").val("08:00");
          $("#endtime").val("08:00");
          $("#description").val("");
      
          // make the form editable
          $("#title").removeAttr("readonly");
          $("#place").removeAttr("disabled");
          $("#allday").removeAttr("disabled");
      
          // don't need to remove readonly attribute from the date
          $("#starttime").removeAttr("disabled");
      
          $("#endtime").removeAttr("disabled");
          $("#description").removeAttr("disabled");
      }

      /*
       * Select from calendar a date for date input
       */
      function onDate()
      {
          if (eventMode!=0)
          {
            // the event is under editable mode, 1--modify or 2--create
        
            $("#calendar").fullCalendar("option","aspectRatio","0.9");
            $("#eventinfo").hide();
            dayClickMode=1;
          }
      }
      
      /*
       *Toggles the Map and Calendar views
       */
      function onSwitchView()
      {  
          if (currentView == "map")
          {
            // from map to calendar
            $("#mapview").css("left","-100%");
            $("#calendarview").css("left","0px");
            $("#switchview").html("MAP");
            currentView = "calendar";
          
          }
          else if (currentView == "calendar")
          {
            // from calendar to map
            $("#calendarview").css("left","100%");
            $("#mapview").css("left","0px");
            $("#switchview").html("CAL.");
            currentView = "map";
          }
      }