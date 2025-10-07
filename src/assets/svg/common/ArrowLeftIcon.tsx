import * as React from "react"
import Svg, { Path } from "react-native-svg"

function ArrowLeftIcon(props:any) {
  return (
    <Svg
      width={18}
      height={16}
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 8a.75.75 0 01-.75.75H2.56l5.47 5.47a.75.75 0 11-1.06 1.06L.22 8.53a.75.75 0 010-1.06L6.97.72a.75.75 0 011.06 1.06L2.56 7.25h14.69A.75.75 0 0118 8z"
        fill="#0D141C"
      />
    </Svg>
  )
}

export default ArrowLeftIcon
