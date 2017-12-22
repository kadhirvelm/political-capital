import { _ } from 'underscore'

const titles = [
  'Honorable',
  'Representative',
  'Senator',
  'Speaker',
  'President',
  'Vice President',
  'Councillor',
  'Delegate',
  'Mayor',
  'Governor',
  'Prefect',
  'Prelate',
  'Premier',
  'Burgess',
  'Ambassador',
  'Envoy',
  'Prime Minister',
  'Magistrate',
  'Secretary',
  'Provost',
  'Chancellor',
]

export function NameGeneratorContext(context, putBackDefaulIfStillEmpty){
  this.randomName = _.sample(titles) + ' '

  this.onFocusHandler = (event) => {
    if(_.isEmpty(event.target.value)){
      putBackDefaulIfStillEmpty()
    }
  }
}
