import { VideoHTMLAttributes, forwardRef, useEffect, useRef } from 'react';

type PropsType = VideoHTMLAttributes<HTMLVideoElement>;
type RefType = any;

export default forwardRef<RefType, PropsType>((props, ref) => {
	if (typeof ref === 'function' || !ref?.current || !ref.current.srcObject) {
		return <div className='bg-neutral-600'></div>;
	}

	console.log(ref.current.srcObject);
	return <video ref={ref} {...props} />;
});
