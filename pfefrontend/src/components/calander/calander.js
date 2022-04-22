import React, { useEffect, useRef, useState } from 'react'
import Reserver, {
  Bar,
  useReserver,
  reserverReducer,
  createBar,
  getPosition,
  resizeBars,
  finishEditingBars,
  Peg,
  Tag,
  evaluatePosition
} from 'react-reserver'
import moment from 'moment'
import Modali, { useModali } from 'modali'
import {
  isObjectEmpty,
  resolveRow,
  resolveDateDiff,
  resolveDate,
  dateRange
} from './helpers'
import { hotelReservations } from './testdata'


function Month(props) {
  return (
    <div
      style={{
        width: props.width,
        display: 'inline-block',
        color: '#adb3b8',
        paddingLeft: '10px',
        borderLeft: '1px solid #d2d2d2'
      }}
    >
      {props.children}{' '}
    </div>
  )
}

function generateColumnTitles(props) {
  return dateRange(props.date, props.columnCount, 'days').map((val, index) => {
    return (
      <div
        key={val}
        style={{
          background: props.titleRange[index] ? '#1ca3f9' : '#fff',
          height: '100%',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontWeight: 500
        }}
      >
        <div>{val}</div>
      </div>
    )
  })
}

function generateRowTitles(row) {
  return [
    { name: 'Single', number: 1, background: '#D6C7A1' },
    { name: 'Single', number: 2, background: '#D6C7A1' },
    { name: 'Double', number: 3, background: '#FFA25B' },
    { name: 'Double', number: 4, background: '#FFA25B' },
    { name: 'Double', number: 5, background: '#FFA25B' },
    { name: 'Presidential', number: 6, background: '#F07966' },
    { name: 'Double', number: 7, background: '#FFA25B' },
    { name: 'Double', number: 8, background: '#FFA25B' },
    { name: 'Single', number: 9, background: '#D6C7A1' },
    { name: 'Single', number: 10, background: '#D6C7A1' },
    { name: 'Single', number: 11, background: '#D6C7A1' },
    { name: 'Single', number: 12, background: '#D6C7A1' },
    { name: 'Double', number: 13, background: '#FFA25B' },
    { name: 'Double', number: 14, background: '#FFA25B' },
    { name: 'Single', number: 15, background: '#D6C7A1' },
    { name: 'Queen', number: 16, background: '#7ED3B2' }
  ].map((room, index) => {
    return (
      <div>
        <div
          style={{
            padding: '3px',
            display: 'flex',
            alignContent: 'center',
            background: row === index ? '#1ca3f9' : room.background
          }}
        >
          <div style={{ fontSize: '13px', marginRight: '10px' }}>
            {room.number}
          </div>
          <div>{room.name}</div>
        </div>
      </div>
    )
  })
}

function useGenerateMonths(count, startDate, width, rowTitleWidth = 0) {
  const [divs, setDivs] = useState([])

  let currentMonth = startDate.format('MMMM')
  let currentWidth = 0
  useEffect(() => {
    const tDivs = []
    ;[...Array(count)].forEach((n, i) => {
      const evaluatedMonth = startDate.clone().add(i, 'days').format('MMMM')

      if (currentMonth !== evaluatedMonth && currentWidth > 0) {
        tDivs.push(
          <Month key={currentMonth} width={currentWidth}>
            {currentMonth}
          </Month>
        )
        currentWidth = 0
        currentMonth = evaluatedMonth
      }

      currentWidth += width
    })

    if (currentWidth > 0) {
      tDivs.push(
        <Month key={currentMonth} width={currentWidth}>
          {currentMonth}
        </Month>
      )
    }

    setDivs(tDivs)
  }, [count, startDate.format('MMMM'), width])

  return divs
}

function calculatePointerLocation(
  column,
  columnWidth,
  rowTitleWidth,
  columnTitleHeight
) {
  return {
    x: column * columnWidth + columnWidth / 2 + rowTitleWidth,
    y: columnTitleHeight
  }
}

function calculateCenterPoint(startLine, endLine) {
  return {
    x: (startLine.x - endLine.x) / 2 + endLine.x,
    y: (endLine.y - startLine.y) / 2 + startLine.y
  }
}

function calculateLinePoint(
  column,
  columnWidth,
  columnTitleHeight,
  row,
  rowHeight,
  rowTitleWidth
) {
  return {
    x: column * columnWidth + rowTitleWidth,
    y: (row + 0.5) * rowHeight + columnTitleHeight
  }
}

const barTemplate = {
  style: '',
  column: '',
  dimension: '',
  end: '',
  id: '',
  img: '',
  length: '',
  row: '',
  start: '',
  text: '',
  to: '',
  from: '',
  type: '',
  editing: '',
  className: '',
  selectedCell: '',
  moving: '',
  draggingLeft: '',
  draggingTop: '',
  content: '',
  lastContent: '',
  firstContent: ''
}
function clearProps(props, template) {
  const finalObject = {}
  Object.keys(template).forEach((key) => {
    if (props[key] !== undefined) {
      finalObject[key] = props[key]
    }
  })

  return finalObject
}

const cancelReservation = (deleteBar, setNewReservation, newReservation) => {
  deleteBar(newReservation)
  setNewReservation({})
}

const cellDimesions = { width: 20, height: 30 }
export default function HotelReservation(props) {
  const {
    bars,
    isEditing,
    setIsEditing,
    addBar,
    deleteBar,
    setBars,
    editBar
  } = useReserver(reserverReducer, [])

  const [addReservationModal, toggleAddReservation] = useModali({
    animated: true,
    title: 'Add Name to Reservation',
    message: 'Deleting this user will be permanent.',
    onEscapeKeyDown: () =>
      cancelReservation(deleteBar, setNewReservation, newReservation),
    onOverlayClicked: () =>
      cancelReservation(deleteBar, setNewReservation, newReservation),
    buttons: [
      <Modali.Button
        label='Cancel'
        isStyleCancel
        onClick={() => {
          toggleAddReservation()
          cancelReservation(deleteBar, setNewReservation, newReservation)
        }}
      />,
      <Modali.Button
        label='Add'
        isStyleDefault
        onClick={() => {
          console.log(newReservation)

          editBar({
            ...newReservation,
            name: guestName,
            new: false,
            editing: false
          })
          toggleAddReservation()
          setNewReservation({})
        }}
      />
    ]
  })
  const windowRef = useRef()
  const startDate = moment('11/03/2022', 'DD/MM/YYYY')
  const columnTitleHeight = 30
  const rowTitleWidth = 130

  const [daysTotal, setDaysTotal] = useState(0)
  const [projectDimensions, setProjectDimensions] = useState({
    width: 0,
    height: 0
  })
  const [guestName, setGuestName] = useState('')
  const [newReservation, setNewReservation] = useState({})

  const [isDragging, setIsDragging] = useState(false)

  const [draggingElement, setDraggingElement] = useState({})

  const [titleRange, setTitleRange] = useState({})
  const [hoverRow, setHoverRow] = useState({})

  const reserverRef = useRef()

  const monthNames = useGenerateMonths(
    daysTotal,
    startDate,
    cellDimesions.width,
    rowTitleWidth
  )

  

  useEffect(() => {
    const windowSize = windowRef.current.getBoundingClientRect()
    const { width, height } = reserverRef.current.getBoundingClientRect()

    setProjectDimensions({ width, height, winWidth: windowSize.width })
  }, [reserverRef.current])

  useEffect(() => {
    const nBars = hotelReservations.map((bar) => {
      bar.dimension = cellDimesions
      if (bar.start && bar.end) {
        bar.length = resolveDateDiff(bar.start, bar.end)
      }

      if (bar.start && bar.end) {
        bar.column = resolveDateDiff(startDate, bar.start)
      }

      return bar
    })

    setBars(nBars)
  }, [])

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          touchAction: 'none'
        }}
      >
        <div
          style={{
            width: projectDimensions.width - rowTitleWidth,
            marginLeft: rowTitleWidth,
            marginBottom: '5px'
          }}
        >
          {monthNames}
        </div>

        <div
          ref={windowRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Reserver
            ref={reserverRef}
            width={projectDimensions.winWidth}
            columnTitleHeight={columnTitleHeight}
            dimension={cellDimesions}
            rowTitleWidth={rowTitleWidth}
            rowTitles={{
              func: () => {
                return generateRowTitles(hoverRow)
              },
              hoverRow
            }}
            columnTitles={{
              func: (columnCount) => {
                setDaysTotal(columnCount)
                return generateColumnTitles({
                  date: startDate,
                  columnCount,
                  titleRange,
                  cellDimesions,
                  rowTitleWidth,
                  columnTitleHeight
                })
              },
              titleRange
            }}
            content={(columnCount, rowCount) => {
              const content = {}

              ;[...Array(rowCount)].forEach((unused, r) => {
                ;[...Array(columnCount)].forEach((unused, c) => {
                  content[`r${r}c${c}`] = (
                    <Peg
                      style={{ background: c % 2 == 0 ? '#EDF1F2' : '#F6F8F9' }}
                    />
                  )
                })
              })

              return content
            }}
            pointerDownCell={(props, e) => {
              console.log('pointer down cell')

              e.target.releasePointerCapture(e.pointerId)
              const newbar = createBar(props.dimension, props.cell, {
                new: true
              })

              const selectionRange = {}

              ;[...Array(newbar.length)].forEach((na, i) => {
                selectionRange[i + newbar.column] = true
              })

              setTitleRange(selectionRange)

              setHoverRow(newbar.row)
              setNewReservation(newbar)
              addBar(newbar)
              setDraggingElement(newbar)
              setIsEditing(true)
            }}
            pointerCancelGrid={(e) => {
              console.log('pionter cancel grid')
            }}
            pointerMoveGrid={(e) => {
              
            }}
            pointerEnterCell={(props, e) => {
              // console.log("Eeee",e.pointerId)
              e.target.releasePointerCapture(e.pointerId)
              if (isDragging && !isEditing) {
                const selectionRange = {}
                ;[...Array(draggingElement.length)].forEach((na, i) => {
                  selectionRange[
                    i + props.cell.column - draggingElement.selectedCell
                  ] = true
                })
                setHoverRow(props.cell.row)
                setTitleRange(selectionRange)
              }

              if (isEditing) {
                const ebar = evaluatePosition(draggingElement, props.cell)

                const selectionRange = {}

                ;[...Array(ebar.length)].forEach((na, i) => {
                  selectionRange[i + ebar.column] = true
                })
                setHoverRow(ebar.row)
                setTitleRange(selectionRange)
                setDraggingElement(ebar)
                editBar(ebar)
              }
            }}
            pointerUpCell={({ cell }) => {
              console.log('pointer up cell')
              console.log('isdragging', isDragging)
              console.log('isediting', isEditing)

              if (isDragging && !isEditing) {
                const bar = {
                  ...draggingElement,
                  row: cell.row,
                  column: cell.column - draggingElement.selectedCell,
                  moving: false
                }

                editBar(bar)

                
                setTitleRange({})
                setHoverRow(-1)
                setIsDragging(false)
              }

              if (isEditing) {
                const bar = bars.find((bar) => {
                  return bar.editing
                })
                if (!isObjectEmpty(newReservation)) {
                  setNewReservation(bar)
                  toggleAddReservation()
                }

                editBar({ ...bar, editing: false })
                setHoverRow(-1)
                setTitleRange({})
                setIsEditing(false)
              }
            }}
          >
            {({ columnTitleHeight, rowTitleWidth }) => {
              return bars.map((bar) => {
                return (
                  <Bar
                    draggable
                    {...bar}
                    onPointerDown={(e, bar) => {
                      e.target.releasePointerCapture(e.pointerId)
                      console.log('pointerdown', isEditing)
                      if (isEditing) {
                        console.log('inside')
                        e.preventDefault()

                        return
                      }
                      console.log('after')

                      const target = e.currentTarget.getBoundingClientRect()

                      const relativeX = e.pageX - target.left
                      const relativeY = e.pageY - target.top

                      const selectedCell = parseInt(
                        relativeX / bar.dimension.width
                      )

                      const element = {
                        ...bar,
                        selectedCell: selectedCell,
                        moving: true,
                        draggingLeft: e.pageX,
                        draggingTop: e.pageY
                      }

                      const exceptionObject = {}

                      exceptionObject.barEnd = {
                        x: bar.dimension.width * bar.length - relativeX,
                        y:
                          bar.dimension.height -
                          bar.dimension.height * 0.5 -
                          relativeY
                      }

                      exceptionObject.barStart = {
                        x: relativeX,
                        y: relativeY - bar.dimension.height * 0.5
                      }

                      if (bar.to) {
                        const toBarIndex = bars.findIndex((b) => {
                          return b.id === bar.to
                        })
                        const toBar = bars[toBarIndex]
                        if (toBarIndex > -1) {
                          exceptionObject.to = calculateLinePoint(
                            toBar.column,
                            toBar.dimension.width,
                            columnTitleHeight,
                            toBar.row,
                            toBar.dimension.height,
                            rowTitleWidth
                          )
                        }
                      }
                      if (bar.from) {
                        const fromBarIndex = bars.findIndex((b) => {
                          return b.id === bar.from
                        })
                        const fromBar = bars[fromBarIndex]
                        exceptionObject['from' + fromBar.id] = fromBar.id
                        if (fromBarIndex > -1) {
                          const location = calculateLinePoint(
                            fromBar.column,
                            fromBar.dimension.width,
                            columnTitleHeight,
                            fromBar.row,
                            fromBar.dimension.height,
                            rowTitleWidth
                          )
                          exceptionObject.from = {
                            x:
                              fromBar.dimension.width * fromBar.length +
                              location.x,
                            y: location.y
                          }
                        }
                      }

                      editBar(element)
                      setDraggingElement(element)
                      console.log('set is dragging true')
                      setIsDragging(true)
                    }}
                    key={bar.id}
                    className={bar.moving ? 'reserver-drag' : ''}
                    lastContent={
                      <div
                        style={{
                          zIndex: 10000,
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center'
                        }}
                      >
                    
                      </div>
                    }
                    firstContent={
                      <div
                        style={{
                          zIndex: 10000,
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center'
                        }}
                      >
                      
                      </div>
                    }
                    style={{
                      ...bar.style,
                      borderRadius: '6px',
                      pointerEvents:
                        bar.editing || bar.moving ? 'none' : 'auto',
                      zIndex: 1000,
                      ...getPosition(
                        bar.row,
                        bar.column,
                        bar.dimension,
                        rowTitleWidth,
                        columnTitleHeight
                      )
                    }}
                  >
                    <Tag
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                        color: '#fff',
                        borderRadius: '6px',
                        width: bar.length * bar.dimension.width - 14,
                        marginLeft: '14px'
                      }}
                    >
                      {bar.name}
                    </Tag>
                  </Bar>
                )
              })
            }}
          </Reserver>
        </div>
      </div>
      <Modali.Modal {...addReservationModal}>
        <div style={{ marginLeft: '20px', padding: '2px' }}>
          <div />
          <div>
            Name:
            <input
              type='text'
              value={guestName}
              onChange={(event) => {
                setGuestName(event.target.value)
              }}
            />
          </div>
        </div>
      </Modali.Modal>
    </>
  )
}