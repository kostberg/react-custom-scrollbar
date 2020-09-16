import React, { useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react';
import useEventListener from './assets/useEventListener';
import useFakeAwait from './assets/useFakeAwait';
import ConditionalWrapper from './assets/ConditionalWrapper';
import useDebounceFunc from './assets/useDebounceFunc';

// Styling
import './assets/scrollbar.scss';

/**
 * We use a negative right on the content to hide original OS scrollbars
 */
const OS_SCROLLBAR_WIDTH = (() => {
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    outer.style.overflow = 'scroll';
    outer.style.width = '100%';
    inner.style.width = '100%';

    document.body.appendChild(outer);
    outer.appendChild(inner);
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.removeChild(inner);
    document.body.removeChild(outer);

    return scrollbarWidth;
})();

/**
 * We need this for OSs that automatically hide the scrollbar (so the offset
 * doesn't change in such case). Eg: macOS with "Automatically based on mouse".
 */
const SCROLLBAR_WIDTH = OS_SCROLLBAR_WIDTH || 20;
const defaultOpts = { 
    className: "scrollbar", 
    disabled: false,
    height: "content",
    shouldRender: true,
    autohide: false
}

function CustomScrollbar({ children, ...options  }) {
    const { className, disabled, height, autohide: authideMS } = { ...defaultOpts, ...options };
    const [scrollRatio, setScrollRatio] = useState(1);
    const [autohide, setAutohide] = useState(false);
    const [isDraggingTrack, setIsDraggingTrack] = useState(false);
    const [disabledScrollbar, setDisabledScrollbar] = useState(disabled);
    useEffect(() => setDisabledScrollbar(disabled), [disabled]);
    const compare = useCallback(ref => {
        if(!ref) return false;
        if(ref.clientHeight) return ref;
        return false;
    }, []);
    const [scrollerNode, setScrollerNode] = useFakeAwait(compare, []);
    const [trackNode, setTrackNode] = useFakeAwait(compare, []);

    const trackAnimationRef = useRef();
    const memoizedProps = useRef({
        authideMS
    });

    const moveTrack = useCallback(e => {
        let moveAnimation;
        let lastPageY = e.pageY;
        let lastScrollTop = scrollerNode.scrollTop;

        setIsDraggingTrack(true);

        const drag = ({ pageY }) => {
            cancelAnimationFrame(moveAnimation);
            moveAnimation = requestAnimationFrame(() => {
                const delta = pageY - lastPageY;
                lastScrollTop += delta / scrollRatio;
                lastPageY = pageY;
                scrollerNode.scrollTop = lastScrollTop;
            });
        };

        const stop = () => {
            setIsDraggingTrack(false);
            window.removeEventListener('mousemove', drag);
        };

        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', stop, { once: true });
        }, [scrollerNode, scrollRatio],
    );
    const autohideFunc = useCallback(() => setAutohide(true), []);
    const autohideTrigger = useDebounceFunc(autohideFunc, authideMS)

    const onScroll = useCallback(() => {
        const { clientHeight, scrollHeight, trackHeight } = memoizedProps.current;
        if (scrollRatio === 1 || !trackNode) return;

        cancelAnimationFrame(trackAnimationRef.current);
        if(memoizedProps.current.authideMS){
            setAutohide(false);
            autohideTrigger();
        }
        trackAnimationRef.current = requestAnimationFrame(() => {
            const ratio = (scrollerNode.scrollTop) / (scrollHeight - clientHeight);
            const y = ratio * (clientHeight - trackHeight);
            trackNode.style.transform = `translateY(${y}px)`;
        });
    }, [scrollerNode, scrollRatio, trackNode, autohideTrigger]);

    const updateScrollbar = useCallback(() => {
        if(!scrollerNode || !trackNode) return;
        let scrollbarAnimation;
        cancelAnimationFrame(scrollbarAnimation);
        scrollbarAnimation = requestAnimationFrame(() => {
            const { clientHeight, scrollHeight } = scrollerNode;
            setScrollRatio(clientHeight / scrollHeight);
            memoizedProps.current = {
                ...memoizedProps.current,
                clientHeight,
                scrollHeight: scrollHeight,
                trackHeight: trackNode.clientHeight + 12 // Plus 12 to get margin on top and bottom
            };
        });
    }, [scrollerNode, trackNode]);

    useLayoutEffect(() => updateScrollbar(), [updateScrollbar]);
    
    useEventListener(window, 'resize', updateScrollbar);

    useLayoutEffect(() => {
        if (disabledScrollbar || !scrollerNode) return;

        scrollerNode.addEventListener('scroll', onScroll);

        return () => {
            scrollerNode.removeEventListener('scroll', onScroll);
        };
    }, [disabledScrollbar, onScroll, scrollerNode]);

    const scrollerStyle = {
        right: `-${SCROLLBAR_WIDTH}px`,
        padding: `0 ${SCROLLBAR_WIDTH}px 0 0`,
        width: `calc(100% + ${OS_SCROLLBAR_WIDTH}px)`
    }

    const trackStyle = {
        right: isDraggingTrack ? 1 : undefined,
        width: isDraggingTrack ? 10 : undefined,
        height: `${scrollRatio * 100}%`,
        opacity: !autohide && (!disabledScrollbar || scrollRatio === 1) ? undefined : 0,
        display: disabledScrollbar ?  'none' : undefined
    }

    return (
        <div className={ className }>
            <div className="wrapper" style={{ marginLeft: `-${SCROLLBAR_WIDTH}px` }}>
                <div className="inner" ref={ setScrollerNode } style={ scrollerStyle }>
                    <ConditionalWrapper
                    condition={ !(height === "content") } 
                    wrapper={ <div className="test" style={{ height }}></div> }>
                        { children }
                    </ConditionalWrapper>
                </div>
            </div>
            <div className="tracker" ref={ setTrackNode } onMouseDown={ disabledScrollbar ? undefined : moveTrack } style={ trackStyle }/>
        </div>
    );
}

export default CustomScrollbar;