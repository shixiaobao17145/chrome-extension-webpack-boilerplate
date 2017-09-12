import "../css/popup.css";
import React from "react";
import { render } from "react-dom";
import Setting from './components/Setting';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const muiTheme = getMuiTheme({
	appBar: {
		height: 48,
	},
});
render(
	<MuiThemeProvider muiTheme={muiTheme}>
		<Setting/>
	</MuiThemeProvider>,
	window.document.getElementById("app-container")
);
