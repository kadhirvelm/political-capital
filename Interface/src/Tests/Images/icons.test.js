/* global describe, test, expect */

import { svgIcon, all_icons } from '../../Images/icons'
import { _ } from 'underscore'

describe('Icons test', () => {
  test('Has all the icons with the right IDs and default colors', () => {
    _.each(_.keys(all_icons), (key) => {
      const icon = svgIcon(key)
      expect(icon.props.id).toEqual(key)
      expect(icon.props.color).not.toBeUndefined()
      expect(icon.props.viewBox).not.toBeUndefined()
      expect(icon.type.name).toEqual('SvgIcon')
    })
  })

  test('Has all the icons with the right IDs and set color', () => {
    _.each(_.keys(all_icons), (key) => {
      const icon = svgIcon(key, '#FFAADD')
      expect(icon.props.id).toEqual(key)
      expect(icon.props.color).toEqual('#FFAADD')
      expect(icon.props.viewBox).not.toBeUndefined()
      expect(icon.type.name).toEqual('SvgIcon')
    })
  })
})
