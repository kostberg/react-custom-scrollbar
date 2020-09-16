/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useRef, useState } from 'react'

const initialOptions = {
    retries: 20,
    maxTime: 500,
    finishBeforeRetry: true,
    passIndex: false
}

/**
 * Synchronous promise: return value when time dependandt function/variable meets a condition
 */

function useFakeAwait(evaluator, dependencys = [], options) {
    const [value, setValue] = useState(undefined);
    const opts = useRef({ ...initialOptions, ...options, evaluator });

    const awaitFunc = useCallback((...args) => {
        const { evaluator, maxTime, retries: _retries, passIndex } = opts.current;
        let interval, result, retries = _retries;
        new Promise(res => {
            interval = setInterval(() => {
                if(retries <= 0) return res(result);
                try {
                    result = (passIndex ? evaluator(retries, ...args) : evaluator(...args));
                } finally {
                    if(result) return res(result);
                }
                --retries;
            }, maxTime / _retries);
        }).then(result => {
            clearInterval(interval);
            setValue(result);
        })
    }, dependencys);

    return [value, awaitFunc];
}

export default useFakeAwait
