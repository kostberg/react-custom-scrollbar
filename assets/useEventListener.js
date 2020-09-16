import { useRef, useEffect } from 'react';
import useDebounceFunc from './useDebounceFunc';

function useEventListener(node, eventName, handler, debouncing = 0){
    const debounceFunc = useDebounceFunc(handler, debouncing);

    const ref = useRef({
        eventName,
        handler: (debouncing ? debounceFunc : handler)
    });

    useEffect(() => {
        const { eventName, handler } = ref.current;
        if(!node) return; // Basic error handling

        // Add event listener
        node.addEventListener(eventName, handler);

        // Remove event listener on cleanup
        return () => {
            node.removeEventListener(eventName, handler);
        };
    }, [node, eventName]);
};

export default useEventListener;