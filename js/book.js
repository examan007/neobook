
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
    const date = searchParams.get("date")
    var Calendar = null
    console.log("BookingManager() params=[" + date + "]")
        function startCalendar() {
            document.addEventListener('DOMContentLoaded', function() {
              const calendarEl = document.getElementById('calendar')
              Calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
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
                dateClick: function(info) {
                  console.log('Clicked on: ' + info.dateStr);
                  console.log('Coordinates: ' + JSON.stringify(info.jsEvent) ) //.pageX + ',' + info.jsEvent.pageY);

                    function sendURLTOParent (params) {
                        // Get a reference to the parent window
                        var parentWindow = window.parent;

                        // Create a message object
                        var message = {
                            operation: "seturistate",
                            newhref: params,
                        }

                        // Send the message to the parent window
                        parentWindow.postMessage(JSON.stringify(message), "*");
                        console.log("message posted [" + JSON.stringify(message) + "]")
                    }
                    function getNewParameters() {
                        const params = window.location.href.split("?")[1]
                        if (typeof(params) === 'undefined') {
                            return "?date=" + info.dateStr
                        } else {
                            return "?date=" + info.dateStr + "&" + params
                        }
                    }
                  const timeselect = info.dateStr.split("T")[1]
                  if (typeof(timeselect) === "undefined") {
                      Calendar.changeView('timeGridDay', info.dateStr);
                      const state = { user: 12 };
                      const title = 'My new page';
                      const params = getNewParameters()
                      console.log("new state url=[" + params + "] href=[" + window.location.href + "]")
                      //window.location.href = url
                      //history.pushState(state, title, url);
                      sendURLTOParent(params)
                  } else {
                      console.log("Pop up appointment request.")
                      closeSidebar()
                      Completion.getLastClickEvent( function (event) {
                            console.log("showappointmentrequest")
                          try {
                              var message = {
                                  operation: 'showappointmentrequest',
                                  datetime: info.dateStr,
                                  xpos: event.clientX,
                                  ypos: event.clientY,
                              }
                              window.parent.postMessage(JSON.stringify(message), "*");
                          } catch (e) {
                            console.log(e.toString())
                          }
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
                  console.log("select date = [" + date + "]")
                  Calendar.changeView('timeGridDay', date);
              } else {
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

