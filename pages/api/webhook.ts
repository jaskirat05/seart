import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/utils/supabaseAdmin';
import type { GenerationStatus } from '@/types/database';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { id: runpodId, status: runpodStatus, output } = req.body;
        console.log('Webhook received:', { runpodId, runpodStatus, output });

        // Map RunPod status to our status
        let generationStatus: GenerationStatus;
        let outputUrl: string | null = null;

        if (runpodStatus === 'COMPLETED') {
            generationStatus = 'completed';
            // Get the image URL from the output
            if (output && output.message) {
                outputUrl = output.message;
                console.log('Image URL from RunPod:', outputUrl);
            }
        } else if (runpodStatus === 'FAILED') {
            generationStatus = 'failed';
        } else {
            generationStatus = 'pending';
        }

        // Update the generation in the database
        const { error: updateError } = await supabaseAdmin
            .from('image_generations')
            .update({
                status: generationStatus,
                image_url: outputUrl,
                updated_at: new Date().toISOString()
            })
            .eq('job_id', runpodId);

        if (updateError) {
            console.error('Error updating generation:', updateError);
            return res.status(500).json({ error: 'Failed to update generation status' });
        }

        console.log('Successfully updated generation:', {
            runpodId,
            status: generationStatus,
            imageUrl: outputUrl
        });

        return res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}