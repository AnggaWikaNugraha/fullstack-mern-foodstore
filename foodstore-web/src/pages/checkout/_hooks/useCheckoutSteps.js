import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const steps = ['Item pesanan', 'Alamat pengiriman', 'Konfirmasi'];

export default function useCheckoutSteps({ itemsReady, addressReady, isBusy, uncertain, submitOrder }) {
    const { search } = useLocation();
    const [activeStep, setActiveStep] = useState(() => new URLSearchParams(search).get('step') === '2' ? 1 : 0);
    const headingRef = useRef(null);
    const previousStep = useRef(activeStep);
    useEffect(() => { setActiveStep(new URLSearchParams(search).get('step') === '2' ? 1 : 0); }, [search]);
    useEffect(() => {
        if (previousStep.current !== activeStep) headingRef.current?.focus({ preventScroll: true });
        previousStep.current = activeStep;
    }, [activeStep]);
    const canContinue = itemsReady && !isBusy && !uncertain && (activeStep === 0 || addressReady);
    return {
        steps, activeStep, headingRef, canContinue,
        actionLabel: isBusy ? 'Memproses...' : ['Pilih alamat', 'Tinjau pesanan', 'Buat pesanan'][activeStep],
        continueCheckout: () => {
            if (!canContinue) return;
            if (activeStep === 2) submitOrder();
            else setActiveStep((step) => step + 1);
        },
        goToStep: (step) => {
            if (!isBusy && !uncertain && step >= 0 && step <= activeStep) setActiveStep(step);
        },
    };
}
