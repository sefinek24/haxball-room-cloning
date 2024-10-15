# About
Reading rooms from Haxball Rooms API. Source: https://github.com/Skarmunds/haxball_rooms_api

# Data summary
| Offset 	 | Bytes 	 | Description                            	                                                     |
|----------|---------|----------------------------------------------------------------------------------------------|
| 0      	 | 1     	 | NULL (uint8) *start of file*           	                                                     |
| 1      	 | 2     	 | Room ID length (uint16) big-endian     	                                                     |
| 3      	 | 11    	 | Room ID                                	                                                     |
| 14     	 | 2     	 | Room data length d (uint16) big endian 	                                                     |
| 16     	 | d     	 | Room data (version, name, flag, latitude, longitude, password, players count, players limit) |

# Room data
| Offset   | Bytes | Description                                       |
|----------|-------|---------------------------------------------------|
| 16       | 2     | Room version (uint16)                             |
| 18       | 1     | Room name length n (uint8)                        |
| 19       | n     | Room name                                         |
| 19+n     | 1     | Room flag code length f (uint8)                   |
| 20+n     | f     | Room flag code                                    |
| 20+n+f   | 4     | Room latitude (float32)                           |
| 24+n+f   | 4     | Room longitude (float32)                          |
| 28+n+f   | 1     | Room password flag (uint8) => 0 = false, 1 = true |
| 29+n+f   | 1     | Room players limit (uint8)                        |
| 30+n+f   | 1     | Room players (uint8)                              |

# Features
1. Table filter by name and flag
2. Table formatting full rooms by red color
3. Double click on row to open room link
4. Table sort by columns
