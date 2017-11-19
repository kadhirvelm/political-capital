/* global describe, test, expect */

import { colors, allColors, allColorHexes } from '../../styles/colors'
import { _ } from 'underscore'

describe('Colors test', () => {
  test('Has all the designated colors', () => {
    const colorMapping = {
      GREEN: '#27AE60',
      RED: '#E74C3C',
      ORANGE: '#D4AC0D',
      LIGHT_BLUE: '#5DADE2',
      MEDIUM_BLUE: '#21618C',
      DARK_BLUE: '#1B4F72',
      LIGHTEST_GRAY: '#D3D3D3',
      LIGHT_GRAY: '#AEB6BF',
      DARK_GRAY: '#424949',
      PASTEL: '#F8F5F2',
      SLIGHTLY_DARKER_PASTEL: '#FDFDFC',
      DARKER_PASTEL: '#F6DFC8',
    }
    _.each(_.keys(colors), (key) => {
      expect(colorMapping[key]).toEqual(colors[key])
    })
  })

  test('All colors and all color hexes line up', () => {
    expect(allColors.length).toEqual(allColorHexes.length)
    const mapping = {
      Blue: '#3498DB',
      Yellow: '#D4AC0D',
      Red: '#E74C3C',
      Green: '#58D68D',
      Gray: '#ABB2B9',
      Purple: '#C39BD3',
    }
    _.each(_.range(allColors.length), (index) => {
      expect(mapping[allColors[index]]).toEqual(allColorHexes[index])
    })
  })
})
