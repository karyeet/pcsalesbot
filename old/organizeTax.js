let str = `Alabama
4
Alaska
0
Arizona
5.6
Arkansas
6.5
California
7.5
Colorado
2.9
Connecticut
6.35
Delaware
0
District of Columbia
5.75
Florida
6
Georgia
4
Hawaii
4
Idaho
6
Illinois
6.25
Indiana
7
Iowa
6
Kansas
6.5
Kentucky
6
Louisiana
4
Maine
5.5
Maryland
6
Massachusetts
6.25
Michigan
6
Minnesota
6.88
Mississippi
7
Missouri
4.23
Montana
0
Nebraska
5.5
Nevada
6.85
New Hampshire
0
New Jersey
7
New Mexico
5.13
New York
4
North Carolina
4.75
North Dakota
5
Ohio
5.75
Oklahoma
4.5
Oregon
0
Pennsylvania
6
Puerto Rico
6
Rhode Island
7
South Carolina
6
South Dakota
4
Tennessee
7
Texas
6.25
Utah
5.95
Vermont
6
Virginia
5.3
Washington
6.5
West Virginia
6
Wisconsin
5
Wyoming
4`

//console.log(str.replace(/[A-z].*\n/g,':'))
let i = 0

let numbers = str.match(/[0-9]\.*[0-9]*/g)
console.log(numbers.length)
  console.log('{')
str.match(/[A-z].*\n/g).forEach((state)=>{ 
  state = state.replace(/\n/,'":')
  //console.log(`${state}:`)

  console.log('"'+state.toLowerCase(),numbers[i]+',')
  i++
})
console.log('}')

