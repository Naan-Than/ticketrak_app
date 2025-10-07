import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function CalendarIcon(props:any) {
  return (
    <Svg
      width="26px"
      height="26px"
      viewBox="0 0 24 24"
      id="magicoon-Filled"
      xmlns="http://www.w3.org/2000/svg"
      // fill="#000"
      fill="#d7bd27ff"
      {...props}
    >
      <G id="SVGRepo_iconCarrier">
        <G id="calendar-Filled">
          <Path
            id="calendar-Filled-2"
            data-name="calendar-Filled"
            d="M21.5 7.94A4.766 4.766 0 0017 3.2V3a1 1 0 00-2 0v.17H9V3a1 1 0 00-2 0v.2a4.766 4.766 0 00-4.5 4.74v1.89a.292.292 0 00.02.09.188.188 0 00-.02.08v7A4.507 4.507 0 007 21.5h10a4.507 4.507 0 004.5-4.5v-7a.188.188 0 00-.02-.08.292.292 0 00.02-.09zM8 18a1 1 0 111-1 1 1 0 01-1 1zm0-4a1 1 0 111-1 1 1 0 01-1 1zm4 4a1 1 0 111-1 1 1 0 01-1 1zm0-4a1 1 0 111-1 1 1 0 01-1 1zm4 4a1 1 0 111-1 1 1 0 01-1 1zm0-4a1 1 0 111-1 1 1 0 01-1 1zm3.5-4.5h-15V7.94a2.766 2.766 0 012.54-2.75A.985.985 0 008 6a1 1 0 00.97-.83h6.06A1 1 0 0016 6a.985.985 0 00.96-.81 2.773 2.773 0 012.54 2.75z"
            // fill="#000"
             fill="#d7bd27ff"
          />
        </G>
      </G>
    </Svg>
  )
}

export default CalendarIcon
