import workflowH from '../../constants/workflow-height.json';
import ponyAdv from '../../constants/workflow-square.json'; 
import fluxDev from '../../constants/flux-workflow.json';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/utils/supabaseAdmin';
import { PointsManager } from '@/utils/points';
import { getWebhookUrl } from '@/utils/getWebhookUrl';
import type { CreateImageGeneration, ModelSettings } from '@/types/database';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: false,
    maxDuration: 300,
  },
}

async function imageAdapter(prompt: string, settings: ModelSettings) {
  
  const jsonData = settings.model ==='pony'? JSON.parse(JSON.stringify(ponyAdv)): settings.model ==='flux'?JSON.parse(JSON.stringify(fluxDev)):JSON.parse(JSON.stringify(ponyAdv));
  
  // Update the dimensions in node 6 of the workflow
  if (settings.model==="flux"){
    jsonData.input.workflow[5].inputs.width = settings.width;
    jsonData.input.workflow[5].inputs.height = settings.height;
    if (settings.seed){
    jsonData.input.workflow[25].inputs.noise_seed = settings.seed;}
    jsonData.input.workflow[6].inputs.text = prompt;
  }
  else if(settings.model==="pony"){
  jsonData.input.workflow[6].inputs.width = settings.width;
  jsonData.input.workflow[6].inputs.height = settings.height;
  if (settings.seed) {
    jsonData.input.workflow[1].inputs.seed = settings.seed;
  }
  const promptWithQuality = `${prompt}`;
  jsonData.input.workflow[4].inputs.text = promptWithQuality;}
  
  // Update webhook URL based on environment
  const webhookUrl = getWebhookUrl();
  jsonData.webhook = webhookUrl;

  
  const workflowStr = JSON.stringify(jsonData);
  console.log('Workflow configuration:', {
    prompt: prompt,
    dimensions: { width: settings.width, height: settings.height },
    webhookUrl,
   
  });
  const urlPonyAdvanced="https://api.runpod.ai/v2/f1idbra00j2itr/run"
  const urlPony4Step='https://api.runpod.ai/v2/4qkezhk11xokyl/run'
  const response = await fetch(urlPonyAdvanced , {
    method: 'POST',
    headers: {
      'Authorization': process.env.RUNPOD_API_KEY!,
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: workflowStr,
  });

  if (!response.ok) {
    throw new Error(`Failed to send data: ${response.statusText}`);
  }
  
  const runpodResponse = await response.json();
  console.log('RunPod Response:', runpodResponse);
  
  return {
    runpodId: runpodResponse.id,
    workflow: settings
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user ID from auth
    const { userId } = getAuth(req);
    
    // Get session ID from headers or create new anonymous session
    let sessionId: string | undefined;
    if (!userId) {
      sessionId=req.headers['x-session-id'] as string;
      console.log('Session ID in upload:', sessionId);
    }

    const { prompt, settings,batchId } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check points availability
    const { hasPoints, pointsBalance,shouldLogin } = await PointsManager.checkPointsAvailable(
      userId || null,
      sessionId || null
    );

    if (!hasPoints && !shouldLogin) {
      return res.status(403).json({
        error: 'Insufficient points',
        pointsBalance,
        required: 1
      });
    }
    else if(!hasPoints||hasPoints && shouldLogin){
      console.log("login required")
      return res.status(410).json({
        error:"login required"
      })
    }

    // Create RunPod job
    const { runpodId, workflow } = await imageAdapter(prompt, settings);

    // Create generation in database
    const generation: CreateImageGeneration = {
      user_id: userId || null,
      job_id: runpodId,
      name: null,
      clerk_id: userId || null,  
      session_id: sessionId || null,
      prompt: prompt,
      favorite: false,
      model_settings: workflow,
      tags:[],
      batch_id: batchId,
    };

    console.log('Creating generation:', generation);
    const { data, error } = await supabaseAdmin
      .from('image_generations')
      .insert(generation)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to create generation: ${error.message}`);
    }

    console.log('Created generation:', data);

    // Deduct points after successful creation
    const remainingPoints = await PointsManager.deductPoints(
      userId || null,
      sessionId || null,
      1
    );

    const response = {
      message: 'Generation created successfully',
      generationId: data.id,
      pointsRemaining: remainingPoints
    };
    console.log('Sending response:', response);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}