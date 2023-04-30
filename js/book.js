
var BookingManager = function() {
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
    const Completion = CompletionMethodObj()
    const searchParams = new URLSearchParams(getParameters());
    const date = searchParams.get("date")
    console.log("BookingManager() params=[" + date + "]")
        function startCalendar() {
            document.addEventListener('DOMContentLoaded', function() {
              const calendarEl = document.getElementById('calendar')
              const calendar = new FullCalendar.Calendar(calendarEl, {
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
                      calendar.changeView('timeGridDay', info.dateStr);
                      const state = { user: 12 };
                      const title = 'My new page';
                      const params = getNewParameters()
                      console.log("new state url=[" + params + "] href=[" + window.location.href + "]")
                      //window.location.href = url
                      //history.pushState(state, title, url);
                      sendURLTOParent(params)
                  } else {
                      console.log("Pop up appointment request.")
                      Completion.getLastClickEvent( function (event) {
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
                    }
                }
              })
              if (date != null) {
                  console.log("select date = [" + date + "]")
                  calendar.changeView('timeGridDay', date);
              } else {
              }
              calendar.render()
            })
        }
        startCalendar()
        document.getElementById("calendar").addEventListener("click", function(event) {
            const x = event.clientX;
            const y = event.clientY;
            console.log(`Clicked at position (${x}, ${y})`);
            Completion.setLastClickEvent(event)
        })

    return {
        show: function() {
            console.log("Booking manager.")
        }
    }
}

