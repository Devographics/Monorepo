import React from 'react';
import T from './T'

export default function SurveyEdition({ name,  year, resultsUrl, imageUrl}) {
	return (
			<div>
				<h4>{year}</h4>
        <img src={imageUrl} width={300}/>
				<h3>{name}</h3>
				<p><a href={resultsUrl}><T k="homepage.view_results"/></a></p>
			</div>
	);
}
