
var BookingManager = function() {
    const console = {
        log: function(msg) {}
    }
    function getParameters() {
        const params = window.location.href.split("?")[1]
        if (typeof(params) === 'undefined') {
            return ""
        } else {
            return "?" + params
        }
    }
    function getHashCode() {
        const hash = window.location.href.split("?")[0].split("#")[1]
        if (typeof(hash) === 'undefined') {
            return ""
        } else {
            return "#" + hash.split("-")[0]
        }
    }
    function getServer() {
        const server = window.location.href.split("?")[0].split("#")[0]
        if (typeof(server) === 'undefined') {
            return ""
        } else {
            return server
        }
    }
    function getTodayDate(daystoadd) {
        const today = new Date();
        today.setDate(today.getDate() + daystoadd);
        const date = today.getDate();
        const month = today.getMonth() + 1; // months are zero-indexed, so add 1
        const year = today.getFullYear();

        const todayString = `${year}-${month}-${date}`;
        console.log(todayString); // outputs something like "4/27/2023"
        return todayString
    }
    var CompletionMethodObj = function (event) {
        var LastClickEvent = null
        var CompletionSet = false
        var CompletionMethod = function (event) {}
        function testExecOrWait() {
            if (LastClickEvent != null ) {
                if (CompletionSet == true) {
                    CompletionMethod(LastClickEvent)
                    LastClickEvent = null
                    CompletionSet = false
                }
            }
        }
        return {
            getLastClickEvent: function (completion) {
                CompletionSet = true
                CompletionMethod = completion
                testExecOrWait()
            },
            setLastClickEvent: function (event) {
                LastClickEvent = event
                testExecOrWait()
            }
       }
    }
    function closeSidebar() {
        const message = {
            operation: 'closesidebar',
        }
        try {
            window.parent.postMessage(JSON.stringify(message), "*");
            console.log("message posted [" + JSON.stringify(message) + "]")
        } catch (e) {
            console.log(e.toString())
        }
    }

    const Completion = CompletionMethodObj()
    const searchParams = new URLSearchParams(getParameters());
    var Calendar = null
    function sendToParent(message) {
        try {
            window.parent.postMessage(JSON.stringify(message), "*");
            console.log("message posted [" + JSON.stringify(message) + "]")
        } catch (e) {
            console.log("sendURLTOParent: " + e.toString())
        }
    }
    function exitlogin() {
      var message = {
        operation: "exitlogin"
      };
      sendToParent(message)
    }
    function sendURLTOParent (params) {
        var message = {
            operation: "seturistate",
            newhref: params,
        }
        sendToParent(message)
    }
    function getMonth(indatestr) {
        try {
            function getValidDateStr(datestr) {
                function getNextValue() {
                    if (datestr === CurrentDate) {
                        return Calendar.getDate()
                    } else {
                        return getValidDateStr(CurrentDate)
                    }
                }
                if (typeof(datestr) === "undefined") {
                    return getNextValue(CurrentDate)
                } else
                if (datestr == null) {
                    return getNextValue(CurrentDate)
                } else {
                    return datestr
                }
            }
            const datestr = getValidDateStr(indatestr)
            const newmoment = moment(datestr, "YYYY-MM-DD");
            const newdatestr = newmoment.format("YYYY-MM");
            console.log("New string: [" + newdatestr + "] CurrentDate: [" + CurrentDate + "]")
            return newdatestr
        } catch (e) {
            console.log(e.toString())
        }
        return indatestr
    }
    function getNewParameters(datestr) {
        const paramsobj = new URLSearchParams(getParameters());
        function getAttrName() {
            if (CurrentView === 'timeGridDay') {
                return 'date'
            } else {
                return 'date'
            }
        }
        function getNewDate() {
            if (CurrentView === 'timeGridDay') {
                return datestr
            } else {
                return getMonth(datestr)
            }
        }
        const attrname = getAttrName()
        const newdate = getNewDate()
        paramsobj.delete(attrname)
        paramsobj.append(attrname, newdate)
        const params = paramsobj.toString()
        if (typeof(params) === 'undefined') {
            return "?" + attrname + "=" + newdate
        } else
        if (params.length > 0) {
            return "?" + params
        } else {
            return "?" + attrname + "=" + newdate
        }
    }
    function pushState(newdate) {
        if (typeof(newdate) === 'undefined') {
        } else
        if (newdate === null ) {
        } else {
            const params = getNewParameters(newdate)
            sendURLTOParent(params)
        }
    }
    function popupRequest(message) {
        console.log("Pop up appointment request.")
        closeSidebar()
        Completion.getLastClickEvent( function (event) {
            console.log(message.operation)
          try {
              message.xpos = event.clientX
              message.ypos = event.clientY
              window.parent.postMessage(JSON.stringify(message), "*");
          } catch (e) {
            console.log(e.toString())
          }
        })
    }
    var CurrentDate = null
    var CurrentView = null
    function setCurrentDate(indateStr) {
        const dateStr = indateStr.replace(/^[^\d]+/, "");
        console.log("select date = [" + dateStr + "]")
        if (CurrentDate !== dateStr)
        try {
            function getInitialState () {
                if (dateStr.length < 8) {
                    return {
                        currentview: 'dayGridMonth',
                        formatstring: 'YYYY-MM'
                    }
                } else {
                    return {
                        currentview: 'timeGridDay',
                        formatstring: 'YYYY-MM-DD'
                    }
                }
            }
            const state = getInitialState()
            var parsedDate = moment(dateStr, state.formatstring);
            Calendar.changeView(state.currentview, dateStr);
            CurrentView = state.currentview
            CurrentDate = dateStr
            console.log("CurrentDate=[" + CurrentDate + "]")
        } catch (e) {
            console.log("setCurrenDate: " + e.toString())
        }
    }
    function addToDate(datestr, days) {
        try {
            var parsedDate = moment(datestr, "YYYY-MM-DD");
            var newMoment = parsedDate.add(days, 'days');
            return newMoment.format("YYYY-MM-DD");
        } catch (e) {
            console.log(e.toString())
        }
        return datestr
    }
    function addToMonth(datestr, months) {
        try {
            var parsedDate = moment(datestr, "YYYY-MM");
            var newMoment = parsedDate.add(months, 'months');
            return newMoment.format("YYYY-MM");
        } catch (e) {
            console.log(e.toString())
        }
        return datestr
    }
            function filterDate() {
                try {
                    const datestr = searchParams.get("date").replace(/"/g, '');
                    return datestr
                } catch (e) {
                    console.log("getting date from query: ", e.toString())
                }
                return null
            }
             const date = filterDate()
        console.log("BookingManager() params=[" + date + "]")

        function startCalendar() {
            document.addEventListener('DOMContentLoaded', function() {
              const calendarEl = document.getElementById('calendar')
                function switchDay(offset) {
                    if (CurrentView === 'timeGridDay') {
                        setCurrentDate(addToDate(CurrentDate, offset))
                        pushState(CurrentDate)
                    } else
                    if (offset === 1) {
                        setCurrentDate(addToMonth(CurrentDate, offset))
                        pushState(CurrentDate)
                    } else {
                        setCurrentDate(addToMonth(CurrentDate, offset))
                        pushState(CurrentDate)
                    }
                    console.log('Next/Prev button clicked; new date is [' + CurrentDate + "]");
                }
                Calendar = new FullCalendar.Calendar(calendarEl, {
                customButtons: {
                  prev: {
                    text: 'Prev',
                    click: function(info) { switchDay(-1) }
                  },
                  next: {
                    text: 'Next',
                    click: function(info) { switchDay(1) }
                  }
                },
                initialView: 'dayGridMonth',
                themeSystem: 'material',
                visibleRange: function(currentDate) {
                    // Generate a new date for manipulating in the next step
                    var startDate = new Date(currentDate.valueOf());
                    var endDate = new Date(currentDate.valueOf());

                    // Adjust the start & end dates, respectively
                    //startDate.setDate(startDate.getDate() - 1); // One day in the past
                    endDate.setDate(endDate.getDate() + 90); // Two days into the future
                    console.log("In visibleRange function.")
                    return { start: startDate, end: endDate };
                  },
                contentHeight: 'auto',
                eventClassNames: function(arg) {
                    //console.log(JSON.stringify(arg))
                    if (arg.view.type === 'timeGridDay') {
                        return [ 'appointment', 'confirmed' ]
                    }
                    return []
                },
                 eventClick: function(info) {
                   console.log('Event clicked:', JSON.stringify(info));
                   if (info.view.type === 'timeGridDay') {
                      popupRequest({
                          operation: 'changeappointmentrequest',
                          datetime: info.event.start,
                          usermessage: info.event.title,
                          event: info.event,
                      })
                   } else {
                        const newdate = JSON.stringify(info.event.start).split('T')[0]
                        console.log("newdate=[" + newdate + "]")
                        setCurrentDate(newdate)
                        pushState(newdate)
                   }
                 },
                 dateClick: function(info) {
                  console.log('Clicked on: ' + info.dateStr);
                  console.log('Coordinates: ' + JSON.stringify(info.jsEvent) ) //.pageX + ',' + info.jsEvent.pageY);
                  const timeselect = info.dateStr.split("T")[1]
                 if (info.view.type !== 'timeGridDay') {
                      setCurrentDate(info.dateStr)
                      pushState(info.dateStr)
                 } else {
                      popupRequest({
                          operation: 'showappointmentrequest',
                          datetime: info.dateStr,
                          usermessage: "",
                      })
                  }
                },
                  headerToolbar: {
                      center: '',
                      end: 'prev,next',
                  },
                views: {
                    timeGridDay: {
                        buttonText: 'My Button',
                        type: 'timeGridDay',
                        allDaySlot: false,
                        slotMinTime: '10:00:00',
                        slotDuration: '00:30:00',
                        displayEventTime: false,
                    }
                },
               })

             if (date != null) {
                  setCurrentDate(date)
                  //pushState(CurrentDate)
              } else {
                  console.log("Default current month.")
                  setCurrentDate(getMonth(Calendar.getDate()))
              }
              Calendar.render()
            })
        }
        startCalendar()
        document.getElementById("calendar").addEventListener("click", function(event) {
            const x = event.clientX;
            const y = event.clientY;
            console.log(`Clicked at position (${x}, ${y})`);
            Completion.setLastClickEvent(event)
        })

        function convertDate(datestr, duration) {
            try {
                var parsedDate = moment(datestr, "dddd, MMMM D, YYYY [at] h:mm A [EDT]");
                var newMoment = parsedDate.add(duration, 'minutes');
                return newMoment.format("YYYY-MM-DDTHH:mm:ss");
            } catch (e) {
                console.log(e.toString())
                return ""
            }
        }

        function createEvent(data) {
          function getTitle() {
            try {
                if (data.request.usermessage.length > 0) {
                    return data.request.usermessage
                }
            } catch (e) {
                console(e.toString())
            }
            return "Appointment booked."
          }
          //var event = {
          //  title: getTitle(),
          //  start: convertDate(data.request.datetime, 0),
          //  end: convertDate(data.request.datetime, 30)
          //}
          //console.log(JSON.stringify(event))
          //Calendar.addEvent(event);
          Calendar.getEvents().forEach(function(event) {
              event.remove();
            });
          Calendar.batchRendering(() => {
            data.events.forEach((newevent) => {
              console.log(JSON.stringify(newevent))
              Calendar.addEvent(newevent);
            });
          });
        }

        function receiveMessage(event) {
          // Check if the message is coming from the expected origin
          console.log("rec mess")
           console.log("origin=[" + JSON.stringify(event) + "]")
           if (event.isTrusted === true) {
              // Process the message data
              var message = event.data;
              console.log("Received message B:", message);
              try {
                const jsonmsg = JSON.parse(message)
                if (jsonmsg.operation === 'createevent') {
                    console.log("create: " + message)
                    createEvent(jsonmsg.data)
                } else
                if (jsonmsg.operation === "readappointments") {
                    console.log("reading appointments: " + message)
                    createEvent(jsonmsg.data)
                }
              } catch (e) {
                console.log(e.toString())
              }
           }
        }
        function registerForEvents() {
            // Add an event listener for the message event
            window.addEventListener("message", receiveMessage, false);
            console.log("Adding event listener")
        }
        registerForEvents()

    return {
        show: function() {
            console.log("Booking manager.")
        },
        create: function (event) {
            console.log("create: " + JSON.stringify(event))
        },
        read: function (id) {
            console.log("read: " + id)
        },
        update: function (event) {
            console.log("update: " + JSON.stringify(event))
        },
        destroy: function (id) {
            console.log("destroy: " + id)
        }
    }
}

