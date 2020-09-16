import React from 'react';

function ConditionalWrapper({ condition, wrapper, children }) {
    return (<>{ condition ? React.cloneElement(wrapper, [], children) : children }</>)
}

export default ConditionalWrapper
