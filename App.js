import React from 'react';

import {MenuProvider} from 'react-native-popup-menu';
import Navigator from './src/Navigator';

const App: () => React$Node = () => {
  return (
    <MenuProvider>
      <Navigator />
    </MenuProvider>
  );
};

export default App;
