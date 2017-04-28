import Routes from './routes'
import ReactEngineClient from 'react-engine/lib/client'
import injectTapEventPlugin from 'react-tap-event-plugin'

injectTapEventPlugin()

// boot options
const options = {
  routes: Routes,

  // supply a function that can be called
  // to resolve the file that was rendered.
  viewResolver (viewName) {
    return require(`./components/${viewName}`)
  }
}

document.addEventListener('DOMContentLoaded', function onLoad () {
  // boot the app when the DOM is ready
  ReactEngineClient.boot(options)
})
